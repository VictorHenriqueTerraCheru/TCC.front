// Gerado por scripts/gen-api.mjs a partir de docs/openapi.json. Não edite à mão: rode npm run gen:api.

export interface paths {
    "/admin/categorias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CategoriaAdminResponse"][];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CriarCategoriaRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CategoriaAdminResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/categorias/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EditarCategoriaRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CategoriaAdminResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/categorias/{id}/ativa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AlterarAtivaCategoriaRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/admin/grupos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CriarGrupoRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GrupoResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/grupos/{chave}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    chave: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EditarGrupoRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GrupoResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    chave: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/usuarios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    busca?: string;
                    perfil?: string;
                    pagina?: number;
                    tamanho?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarUsuariosItem"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/usuarios/{id}/perfil": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AlterarPerfilRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/admin/verificacoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: string;
                    pagina?: number;
                    tamanho?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarVerificacoesItem"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/verificacoes/{id}/aprovar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/verificacoes/{id}/recusar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RecusarVerificacaoRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/cadastro": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CadastrarRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RespostaAuth"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EntrarRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RespostaAuth"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/categorias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ListarCategoriasResponse"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/geocodificacao/reversa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    lat: number;
                    lng: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReversaResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Too Many Requests */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/grupos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GrupoResponse"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/incidentes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RegistrarIncidenteRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterAreaIncidentesResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/incidentes/area": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    lat: number;
                    lng: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterAreaIncidentesResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/incidentes/calor": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    minLat: number;
                    minLng: number;
                    maxLat: number;
                    maxLng: number;
                    dias?: number;
                    grupos?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterCalorIncidentesResponse"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterMeResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AtualizarMeRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterMeResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/me/historico": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    filtro?: string;
                    pagina?: number;
                    tamanho?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoObterHistoricoItem"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/problemas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    minLat: number;
                    minLng: number;
                    maxLat: number;
                    maxLng: number;
                    grupos?: string;
                    status?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ListarProblemasNaAreaResponse"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RegistrarProblemaRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/problemas/duplicatas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    categoriaId: number;
                    lat: number;
                    lng: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BuscarDuplicatasResponse"][];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/problemas/recentes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    lat: number;
                    lng: number;
                    raioKm?: number;
                    grupos?: string;
                    pagina?: number;
                    tamanho?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarProblemasRecentesItem"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/problemas/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/problemas/{id}/voto": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["VotarRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/saude": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StatusSaudeResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/saude/banco": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StatusSaudeResponse"];
                    };
                };
                /** @description Service Unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/verificacoes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SolicitarVerificacaoRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SolicitarVerificacaoResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AlterarAtivaCategoriaRequest: {
            ativa: boolean;
        };
        AlterarPerfilRequest: {
            perfil: components["schemas"]["Perfil"];
        };
        AtualizarMeRequest: {
            nome: string;
        };
        BuscarDuplicatasResponse: {
            categoria: components["schemas"]["CategoriaResumo"];
            /** Format: int32 */
            confirmacoes: number;
            /** Format: date-time */
            criadoEm: string;
            /** Format: int32 */
            distanciaMetros: number;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
            /** Format: uuid */
            id: string;
        };
        CadastrarRequest: {
            aceitouTermos: boolean;
            email: string;
            nome: string;
            senha: string;
        };
        CategoriaAdminResponse: {
            ativa: boolean;
            grupo: string;
            icone: string;
            /** Format: int16 */
            id: number;
            nome: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        CategoriaResumo: {
            grupo: string;
            icone: string;
            /** Format: int16 */
            id: number;
            nome: string;
        };
        /** @enum {unknown} */
        CorGrupo: "laranja" | "ocre" | "marrom" | "vermelho" | "terracota" | "azul" | "verdeAgua" | "roxo" | "rosa" | "cinza";
        CriarCategoriaRequest: {
            grupo: string;
            icone: string;
            nome: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        CriarGrupoRequest: {
            cor: components["schemas"]["CorGrupo"];
            rotulo: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        EditarCategoriaRequest: {
            grupo: string;
            icone: string;
            nome: string;
        };
        EditarGrupoRequest: {
            cor: components["schemas"]["CorGrupo"];
            /** Format: int32 */
            ordem: number;
            rotulo: string;
        };
        EntrarRequest: {
            email: string;
            senha: string;
        };
        /** @enum {unknown} */
        FaixaConfianca: "baixa" | "media" | "alta";
        GrupoResponse: {
            chave: string;
            cor: components["schemas"]["CorGrupo"];
            /** Format: int32 */
            ordem: number;
            rotulo: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        HttpValidationProblemDetails: {
            detail?: null | string;
            errors?: {
                [key: string]: string[];
            };
            instance?: null | string;
            /** Format: int32 */
            status?: null | number;
            title?: null | string;
            type?: null | string;
        };
        ListarCategoriasResponse: {
            grupo: string;
            icone: string;
            /** Format: int16 */
            id: number;
            nome: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        ListarProblemasNaAreaResponse: {
            /** Format: int16 */
            categoriaId: number;
            /** Format: double */
            confianca: null | number;
            faixa: null | components["schemas"]["FaixaConfianca"];
            /** Format: uuid */
            id: string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            status: components["schemas"]["StatusProblema"];
        };
        ListarProblemasRecentesItem: {
            categoria: components["schemas"]["CategoriaResumo"];
            /** Format: date-time */
            criadoEm: string;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
            /** Format: uuid */
            id: string;
            status: components["schemas"]["StatusProblema"];
        };
        ListarUsuariosItem: {
            /** Format: date-time */
            criadoEm: string;
            email: string;
            /** Format: uuid */
            id: string;
            nome: string;
            perfil: components["schemas"]["Perfil"];
            /** Format: date-time */
            verificadoEm: string | null;
        };
        ListarVerificacoesItem: {
            /** Format: date-time */
            criadaEm: string;
            /** Format: uuid */
            id: string;
            justificativa: string;
            motivoRecusa: null | string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
            usuario: components["schemas"]["ListarVerificacoesUsuarioResumo"];
        };
        ListarVerificacoesUsuarioResumo: {
            /** Format: uuid */
            id: string;
            iniciais: string;
            nome: string;
        };
        /** @enum {unknown} */
        NivelConcentracao: "baixa" | "media" | "alta";
        ObterAreaIncidentesContagem: {
            /** Format: int16 */
            categoriaId: number;
            /** Format: int32 */
            dias30: number;
            /** Format: int32 */
            dias7: number;
            nome: string;
        };
        ObterAreaIncidentesResponse: {
            /** Format: date-time */
            atualizadoEm: string;
            contagens: components["schemas"]["ObterAreaIncidentesContagem"][];
            nivel: components["schemas"]["NivelConcentracao"];
            /** Format: int32 */
            raioMetros: number;
        };
        ObterCalorIncidentesResponse: {
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            /** Format: int32 */
            quantidade: number;
        };
        ObterDetalheProblemaAvaliacao: {
            /** Format: date-time */
            encerraEm: string;
            /** Format: int32 */
            necessarios: number;
            /** Format: int32 */
            votantes: number;
        };
        ObterDetalheProblemaResponse: {
            avaliacao: null | components["schemas"]["ObterDetalheProblemaAvaliacao"];
            categoria: components["schemas"]["CategoriaResumo"];
            /** Format: double */
            confianca: null | number;
            /** Format: date-time */
            criadoEm: string;
            descricao: null | string;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
            /** Format: uuid */
            id: string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            meuVoto: null | components["schemas"]["ValorVotoContrato"];
            souAutor: boolean;
            status: components["schemas"]["StatusProblema"];
            votos: components["schemas"]["ObterDetalheProblemaVotos"];
        };
        ObterDetalheProblemaVotos: {
            /** Format: int32 */
            nao: number;
            /** Format: int32 */
            naoUltimas24h: number;
            /** Format: int32 */
            sim: number;
        };
        ObterHistoricoItem: {
            categoria: components["schemas"]["CategoriaResumo"];
            /** Format: date-time */
            data: string;
            endereco: null | string;
            /** Format: uuid */
            ocorrenciaId: null | string;
            statusProblema: null | components["schemas"]["StatusProblema"];
            tipo: components["schemas"]["ObterHistoricoTipoItem"];
            valor: null | components["schemas"]["ObterHistoricoValorItem"];
        };
        /** @enum {unknown} */
        ObterHistoricoTipoItem: "registroProblema" | "registroIncidente" | "voto";
        /** @enum {unknown} */
        ObterHistoricoValorItem: "sim" | "nao";
        ObterMeResponse: {
            /** Format: date-time */
            criadoEm: string;
            email: string;
            /** Format: uuid */
            id: string;
            nome: string;
            perfil: components["schemas"]["Perfil"];
            /** Format: int32 */
            totalRegistros: number;
            /** Format: int32 */
            totalVotos: number;
            verificacao: null | components["schemas"]["ObterMeVerificacaoResumo"];
            /** Format: date-time */
            verificadoEm: string | null;
        };
        ObterMeVerificacaoResumo: {
            /** Format: date-time */
            criadaEm: string;
            motivoRecusa: null | string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
        };
        PaginadoListarProblemasRecentesItem: {
            itens: components["schemas"]["ListarProblemasRecentesItem"][];
            /** Format: int32 */
            pagina: number;
            /** Format: int32 */
            tamanho: number;
            /** Format: int32 */
            total: number;
        };
        PaginadoListarUsuariosItem: {
            itens: components["schemas"]["ListarUsuariosItem"][];
            /** Format: int32 */
            pagina: number;
            /** Format: int32 */
            tamanho: number;
            /** Format: int32 */
            total: number;
        };
        PaginadoListarVerificacoesItem: {
            itens: components["schemas"]["ListarVerificacoesItem"][];
            /** Format: int32 */
            pagina: number;
            /** Format: int32 */
            tamanho: number;
            /** Format: int32 */
            total: number;
        };
        PaginadoObterHistoricoItem: {
            itens: components["schemas"]["ObterHistoricoItem"][];
            /** Format: int32 */
            pagina: number;
            /** Format: int32 */
            tamanho: number;
            /** Format: int32 */
            total: number;
        };
        /** @enum {unknown} */
        Perfil: "cidadao" | "cidadaoVerificado" | "administrador";
        ProblemDetails: {
            detail?: null | string;
            instance?: null | string;
            /** Format: int32 */
            status?: null | number;
            title?: null | string;
            type?: null | string;
        };
        RecusarVerificacaoRequest: {
            motivo: string;
        };
        RegistrarIncidenteRequest: {
            /** Format: int16 */
            categoriaId: number;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            /** Format: date-time */
            ocorridoEm: string;
        };
        RegistrarProblemaRequest: {
            /** Format: int16 */
            categoriaId: number;
            descricao: null | string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
        };
        RespostaAuth: {
            /** Format: date-time */
            expiraEm: string;
            token: string;
            usuario: components["schemas"]["RespostaAuthUsuarioResumo"];
        };
        RespostaAuthUsuarioResumo: {
            email: string;
            /** Format: uuid */
            id: string;
            nome: string;
            perfil: components["schemas"]["Perfil"];
        };
        ReversaResponse: {
            bairro: null | string;
            cidade: null | string;
            disponivel: boolean;
            endereco: string;
            logradouro: null | string;
            numero: null | string;
            rotuloArea: null | string;
            uf: null | string;
        };
        SolicitarVerificacaoRequest: {
            justificativa: string;
            tipoVinculo: components["schemas"]["TipoVinculo"];
        };
        SolicitarVerificacaoResponse: {
            /** Format: date-time */
            criadaEm: string;
            /** Format: uuid */
            id: string;
            justificativa: string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
        };
        /** @enum {unknown} */
        StatusProblema: "nova" | "ativa" | "possivelmenteResolvida" | "resolvida";
        StatusSaudeResponse: {
            status: string;
        };
        /** @enum {unknown} */
        StatusVerificacao: "pendente" | "aprovada" | "recusada";
        /** @enum {unknown} */
        TipoOcorrencia: "problema" | "incidente";
        /** @enum {unknown} */
        TipoVinculo: "moradorRegiao" | "trabalhaRegiao" | "servidorPublico" | "outro";
        /** @enum {unknown} */
        ValorVotoContrato: "sim" | "nao";
        VotarRequest: {
            /** Format: double */
            lat: null | number;
            /** Format: double */
            lng: null | number;
            valor: components["schemas"]["ValorVotoContrato"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
