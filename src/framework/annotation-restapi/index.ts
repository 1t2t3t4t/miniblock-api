import 'reflect-metadata'
import express from 'express'
import construct = Reflect.construct;

enum MetaDataKey {
    Router = 'route',
    SubRouter = 'subRouter',
    Endpoint = 'endpoint',
    Middleware = 'middleware'
}

//------------------Router--------------------

type RouterInfo = {
    path: string
}

export function RouterController(path: string): ClassDecorator {
    return function(target) {
        const info: RouterInfo = {
            path
        }
        Reflect.defineMetadata(MetaDataKey.Router, info, target)
        return target
    }
}

//------------------SubRouter--------------------

type SubRouterInfo = {
    parent: Object,
    controllers: Object[]
}

export function SubRouterControllers(controllers: Object[]): ClassDecorator {
    return function(parent) {
        const info: SubRouterInfo = {
            parent,
            controllers
        }

        Reflect.defineMetadata(MetaDataKey.SubRouter, info, parent)
        return parent
    }
}

type EndpointFunction = (req: express.Request, res: express.Response, next: express.NextFunction) => any

enum HTTPMethod {
    get = 'get',
    post = 'post',
    put = 'put',
    patch = 'patch',
    delete = 'delete'
}
type EndpointInfo = {
    name: PropertyKey,
    path: string,
    method: HTTPMethod,
    func: EndpointFunction
}

//------------------MIDDLEWARE--------------------

type MiddlewareInfo = {
    middleware: EndpointFunction,
    name: PropertyKey
}

export function Middleware(middleware: EndpointFunction) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        if (!descriptor.value) {
            throw Error(`${target} ${String(propertyKey)} is invalid`)
        }
        if (!Reflect.hasMetadata(MetaDataKey.Middleware, target.constructor)) {
            Reflect.defineMetadata(MetaDataKey.Middleware, [], target.constructor)
        }

        let middlewareInfos: Array<MiddlewareInfo> = Reflect.getMetadata(MetaDataKey.Middleware, target.constructor)
        const info: MiddlewareInfo = {
            middleware,
            name: propertyKey
        }
        middlewareInfos.push(info)
        Reflect.defineMetadata(MetaDataKey.Middleware, middlewareInfos, target.constructor)
        return descriptor
    }
}

//------------------ENDPOINT--------------------

const defineMethodMetadata = (target: Object,
                              propertyKey: string | symbol,
                              descriptor: TypedPropertyDescriptor<EndpointFunction>,
                              path: string,
                              method: HTTPMethod) => {
    if (!descriptor.value) {
        throw Error(`${target} ${String(propertyKey)} is invalid`)
    }
    if (!Reflect.hasMetadata(MetaDataKey.Endpoint, target.constructor)) {
        Reflect.defineMetadata(MetaDataKey.Endpoint, [], target.constructor)
    }

    let endpoints: Array<EndpointInfo> = Reflect.getMetadata(MetaDataKey.Endpoint, target.constructor)
    const info: EndpointInfo = {
        name: propertyKey,
        path,
        method: method,
        func: descriptor.value!
    }
    endpoints.push(info)
    Reflect.defineMetadata(MetaDataKey.Endpoint, endpoints, target.constructor)
    return descriptor
}

export function GET(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, HTTPMethod.get)
    }
}

export function POST(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, HTTPMethod.post)
    }
}

export function PUT(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, HTTPMethod.put)
    }
}

export function PATCH(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, HTTPMethod.patch)
    }
}

export function DELETE(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, HTTPMethod.delete)
    }
}

//------------------REGISTRATION--------------------

interface Class extends Object {
    new (): any
}

function registerEndpoint(target: Class, router: express.Router, controller: object) {
    const endpointInfos: Array<EndpointInfo> = Reflect.getMetadata(MetaDataKey.Endpoint, target)

    endpointInfos.forEach((info) => {
        const middlewareInfos: Array<MiddlewareInfo> = Reflect.getMetadata(MetaDataKey.Middleware, target) || []
        const middlewares: Array<EndpointFunction> = middlewareInfos
            .filter((endpointInfo) => endpointInfo.name === info.name)
            .map((info) => info.middleware)
        switch (info.method) {
            case HTTPMethod.get:
                router.get(info.path, ...middlewares, info.func.bind(controller))
                break
            case HTTPMethod.post:
                router.post(info.path, ...middlewares, info.func.bind(controller))
                break
            case HTTPMethod.put:
                router.put(info.path, ...middlewares, info.func.bind(controller))
                break
            case HTTPMethod.patch:
                router.patch(info.path, ...middlewares, info.func.bind(controller))
                break
            case HTTPMethod.delete:
                router.delete(info.path, ...middlewares, info.func.bind(controller))
                break
        }
    })
}


function registerSubRouters(router: express.Router, parent: Class) {
    const subRouterInfo: SubRouterInfo = Reflect.getMetadata(MetaDataKey.SubRouter, parent)
    if (!subRouterInfo) { return }

    subRouterInfo.controllers.forEach((controller) => {
        const subTarget = controller as Class
        const subController = new subTarget()

        const subRouter = express.Router({ mergeParams: true })

        const routerInfo: RouterInfo = Reflect.getMetadata(MetaDataKey.Router, subTarget)

        router.use(routerInfo.path, subRouter)

        registerEndpoint(subTarget, subRouter, subController)
        registerSubRouters(subRouter, subTarget)
    })
}

export function register(app: express.Application | express.Router, target: Class) {
    const controller = new target()
    const routerInfo: RouterInfo = Reflect.getMetadata(MetaDataKey.Router, target)

    const router = express.Router({ mergeParams: true })

    registerEndpoint(target, router, controller)
    registerSubRouters(router, target)
    
    app.use(routerInfo.path, router)
    return controller
}