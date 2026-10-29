
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CategoriaAdminResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CategoriaAdminResponse"];
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GrupoResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GrupoResponse"];
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarUsuariosItem"];
                    };
                };
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
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarVerificacoesItem"];
                    };
                };
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
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
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
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RespostaAuth"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RespostaAuth"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReversaResponse"];
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterAreaIncidentesResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterAreaIncidentesResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterCalorIncidentesResponse"][];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterMeResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoObterHistoricoItem"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ListarProblemasNaAreaResponse"][];
                    };
                };
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["BuscarDuplicatasResponse"][];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["PaginadoListarProblemasRecentesItem"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ObterDetalheProblemaResponse"];
                    };
                };
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
                    };
                };
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
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["StatusSaudeResponse"];
                    };
                };
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
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SolicitarVerificacaoResponse"];
                    };
                };
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
            confirmacoes: number;
            criadoEm: string;
            distanciaMetros: number;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
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
            id: number;
            nome: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        CategoriaResumo: {
            grupo: string;
            icone: string;
            id: number;
            nome: string;
        };
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
            ordem: number;
            rotulo: string;
        };
        EntrarRequest: {
            email: string;
            senha: string;
        };
        FaixaConfianca: "baixa" | "media" | "alta";
        GrupoResponse: {
            chave: string;
            cor: components["schemas"]["CorGrupo"];
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
            status?: null | number;
            title?: null | string;
            type?: null | string;
        };
        ListarCategoriasResponse: {
            grupo: string;
            icone: string;
            id: number;
            nome: string;
            tipo: components["schemas"]["TipoOcorrencia"];
        };
        ListarProblemasNaAreaResponse: {
            categoriaId: number;
            confianca: null | number;
            faixa: null | components["schemas"]["FaixaConfianca"];
            id: string;
            lat: number;
            lng: number;
            status: components["schemas"]["StatusProblema"];
        };
        ListarProblemasRecentesItem: {
            categoria: components["schemas"]["CategoriaResumo"];
            criadoEm: string;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
            id: string;
            status: components["schemas"]["StatusProblema"];
        };
        ListarUsuariosItem: {
            criadoEm: string;
            email: string;
            id: string;
            nome: string;
            perfil: components["schemas"]["Perfil"];
            verificadoEm: string | null;
        };
        ListarVerificacoesItem: {
            criadaEm: string;
            id: string;
            justificativa: string;
            motivoRecusa: null | string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
            usuario: components["schemas"]["ListarVerificacoesUsuarioResumo"];
        };
        ListarVerificacoesUsuarioResumo: {
            id: string;
            iniciais: string;
            nome: string;
        };
        NivelConcentracao: "baixa" | "media" | "alta";
        ObterAreaIncidentesContagem: {
            categoriaId: number;
            dias30: number;
            dias7: number;
            nome: string;
        };
        ObterAreaIncidentesResponse: {
            atualizadoEm: string;
            contagens: components["schemas"]["ObterAreaIncidentesContagem"][];
            nivel: components["schemas"]["NivelConcentracao"];
            raioMetros: number;
        };
        ObterCalorIncidentesResponse: {
            lat: number;
            lng: number;
            quantidade: number;
        };
        ObterDetalheProblemaAvaliacao: {
            encerraEm: string;
            necessarios: number;
            votantes: number;
        };
        ObterDetalheProblemaResponse: {
            avaliacao: null | components["schemas"]["ObterDetalheProblemaAvaliacao"];
            categoria: components["schemas"]["CategoriaResumo"];
            confianca: null | number;
            criadoEm: string;
            descricao: null | string;
            endereco: string;
            faixa: null | components["schemas"]["FaixaConfianca"];
            id: string;
            lat: number;
            lng: number;
            meuVoto: null | components["schemas"]["ValorVotoContrato"];
            souAutor: boolean;
            status: components["schemas"]["StatusProblema"];
            votos: components["schemas"]["ObterDetalheProblemaVotos"];
        };
        ObterDetalheProblemaVotos: {
            nao: number;
            naoUltimas24h: number;
            sim: number;
        };
        ObterHistoricoItem: {
            categoria: components["schemas"]["CategoriaResumo"];
            data: string;
            endereco: null | string;
            ocorrenciaId: null | string;
            statusProblema: null | components["schemas"]["StatusProblema"];
            tipo: components["schemas"]["ObterHistoricoTipoItem"];
            valor: null | components["schemas"]["ObterHistoricoValorItem"];
        };
        ObterHistoricoTipoItem: "registroProblema" | "registroIncidente" | "voto";
        ObterHistoricoValorItem: "sim" | "nao";
        ObterMeResponse: {
            criadoEm: string;
            email: string;
            id: string;
            nome: string;
            perfil: components["schemas"]["Perfil"];
            totalRegistros: number;
            totalVotos: number;
            verificacao: null | components["schemas"]["ObterMeVerificacaoResumo"];
            verificadoEm: string | null;
        };
        ObterMeVerificacaoResumo: {
            criadaEm: string;
            motivoRecusa: null | string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
        };
        PaginadoListarProblemasRecentesItem: {
            itens: components["schemas"]["ListarProblemasRecentesItem"][];
            pagina: number;
            tamanho: number;
            total: number;
        };
        PaginadoListarUsuariosItem: {
            itens: components["schemas"]["ListarUsuariosItem"][];
            pagina: number;
            tamanho: number;
            total: number;
        };
        PaginadoListarVerificacoesItem: {
            itens: components["schemas"]["ListarVerificacoesItem"][];
            pagina: number;
            tamanho: number;
            total: number;
        };
        PaginadoObterHistoricoItem: {
            itens: components["schemas"]["ObterHistoricoItem"][];
            pagina: number;
            tamanho: number;
            total: number;
        };
        Perfil: "cidadao" | "cidadaoVerificado" | "administrador";
        ProblemDetails: {
            detail?: null | string;
            instance?: null | string;
            status?: null | number;
            title?: null | string;
            type?: null | string;
        };
        RecusarVerificacaoRequest: {
            motivo: string;
        };
        RegistrarIncidenteRequest: {
            categoriaId: number;
            lat: number;
            lng: number;
            ocorridoEm: string;
        };
        RegistrarProblemaRequest: {
            categoriaId: number;
            descricao: null | string;
            lat: number;
            lng: number;
        };
        RespostaAuth: {
            expiraEm: string;
            token: string;
            usuario: components["schemas"]["RespostaAuthUsuarioResumo"];
        };
        RespostaAuthUsuarioResumo: {
            email: string;
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
            criadaEm: string;
            id: string;
            justificativa: string;
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
        };
        StatusProblema: "nova" | "ativa" | "possivelmenteResolvida" | "resolvida";
        StatusSaudeResponse: {
            status: string;
        };
        StatusVerificacao: "pendente" | "aprovada" | "recusada";
        TipoOcorrencia: "problema" | "incidente";
        TipoVinculo: "moradorRegiao" | "trabalhaRegiao" | "servidorPublico" | "outro";
        ValorVotoContrato: "sim" | "nao";
        VotarRequest: {
            lat: null | number;
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
