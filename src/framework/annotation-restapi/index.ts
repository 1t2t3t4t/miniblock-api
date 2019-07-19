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
            path, target: target.constructor
        }
        Reflect.defineMetadata(MetaDataKey.SubRouter, info, parent.constructor)
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

function registerSubRouter(router: express.Router, target: Class) {

}

export function register(app: express.Application, target: Class) {
    const controller = new target()
    const routerInfo: RouterInfo = Reflect.getMetadata(MetaDataKey.Router, target)

    const router = express.Router()

    const endpointInfos: Array<EndpointInfo> = Reflect.getMetadata(MetaDataKey.Endpoint, target)

    endpointInfos.forEach((info) => {
        switch (info.method) {
            case "get":
                router.get(info.path, (res, req, next) => {
                    controller[info.name](res, req, next)
                })
                break
            case "post":
                router.post(info.path, (res, req, next) => {
                    controller[info.name](res, req, next)
                })
                break
        }
    })

    app.use(routerInfo.path, router)
    return controller
}