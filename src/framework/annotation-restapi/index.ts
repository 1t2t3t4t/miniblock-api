import 'reflect-metadata'
import express from 'express'
import construct = Reflect.construct;

enum MetaDataKey {
    Router = 'route',
    SubRouter = 'subRouter',
    Endpoint = 'endpoint'
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
    path: string,
    target: Object
}

export function SubRouterController(parent: Object, path: string): ClassDecorator {
    return function(target) {
        const info: SubRouterInfo = {
            path, target
        }

        if (!Reflect.hasMetadata(MetaDataKey.SubRouter, parent)) {
            Reflect.defineMetadata(MetaDataKey.SubRouter, [], parent)
        }

        let subRouterInfos: Array<SubRouterInfo> = Reflect.getMetadata(MetaDataKey.SubRouter, parent)
        subRouterInfos.push(info)
        Reflect.defineMetadata(MetaDataKey.SubRouter, subRouterInfos, parent)
        return target
    }
}

type EndpointFunction = (req: express.Request, res: express.Response, next: express.NextFunction) => any

type HTTPMethod = 'get' | 'post'
type EndpointInfo = {
    name: string,
    path: string,
    method: HTTPMethod,
    func: EndpointFunction
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
        name: String(propertyKey),
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
        return defineMethodMetadata(target, propertyKey, descriptor, path, "get")
    }
}

export function POST(path: string) {
    return function(target: Object,
                    propertyKey: string | symbol,
                    descriptor: TypedPropertyDescriptor<EndpointFunction>) {
        return defineMethodMetadata(target, propertyKey, descriptor, path, "post")
    }
}

//------------------REGISTRATION--------------------

interface Class extends Object {
    new (): any
}

function registerEndpoint(target: Class, router: express.Router, controller: object) {
    const endpointInfos: Array<EndpointInfo> = Reflect.getMetadata(MetaDataKey.Endpoint, target)

    endpointInfos.forEach((info) => {
        switch (info.method) {
            case "get":
                router.get(info.path, info.func.bind(controller))
                break
            case "post":
                router.post(info.path, info.func.bind(controller))
                break
        }
    })
}

function registerSubRouters(router: express.Router, parent: Class) {
    const subRouterInfos: Array<SubRouterInfo> = Reflect.getMetadata(MetaDataKey.SubRouter, parent)
    if (!subRouterInfos) { return }
    subRouterInfos.forEach((subRouterInfo) => {
        const subTarget = subRouterInfo.target as Class
        const controller = new subTarget()

        const subRouter = express.Router()

        router.use(subRouterInfo.path, subRouter)

        registerEndpoint(subTarget, subRouter, controller)
        registerSubRouters(subRouter, subTarget)
    })
}

export function register(app: express.Application, target: Class) {
    const controller = new target()
    const routerInfo: RouterInfo = Reflect.getMetadata(MetaDataKey.Router, target)

    const router = express.Router()

    registerEndpoint(target, router, controller)
    registerSubRouters(router, target)

    app.use(routerInfo.path, router)
    return controller
}