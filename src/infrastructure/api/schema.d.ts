// Gerado por scripts/gen-api.mjs a partir de docs/openapi.json. Não edite à mão: rode npm run gen:api.

export interface paths {
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
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AtualizarMeRequest: {
            nome: string;
        };
        BuscarDuplicatasResponse: {
            /** Format: uuid */
            id: string;
            categoria: components["schemas"]["CategoriaResumo"];
            endereco: string;
            /** Format: date-time */
            criadoEm: string;
            /** Format: int32 */
            distanciaMetros: number;
            faixa: null | components["schemas"]["FaixaConfianca"];
            /** Format: int32 */
            confirmacoes: number;
        };
        CadastrarRequest: {
            nome: string;
            email: string;
            senha: string;
            aceitouTermos: boolean;
        };
        CategoriaResumo: {
            /** Format: int16 */
            id: number;
            nome: string;
            grupo: string;
            icone: string;
        };
        EntrarRequest: {
            email: string;
            senha: string;
        };
        /** @enum {unknown} */
        FaixaConfianca: "baixa" | "media" | "alta";
        HttpValidationProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
            errors?: {
                [key: string]: string[];
            };
        };
        ListarCategoriasResponse: {
            /** Format: int16 */
            id: number;
            nome: string;
            grupo: string;
            tipo: components["schemas"]["TipoOcorrencia"];
            icone: string;
        };
        ListarProblemasNaAreaResponse: {
            /** Format: uuid */
            id: string;
            /** Format: int16 */
            categoriaId: number;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            status: components["schemas"]["StatusProblema"];
            /** Format: double */
            confianca: null | number;
            faixa: null | components["schemas"]["FaixaConfianca"];
        };
        ListarProblemasRecentesItem: {
            /** Format: uuid */
            id: string;
            categoria: components["schemas"]["CategoriaResumo"];
            endereco: string;
            /** Format: date-time */
            criadoEm: string;
            status: components["schemas"]["StatusProblema"];
            faixa: null | components["schemas"]["FaixaConfianca"];
        };
        ListarVerificacoesItem: {
            /** Format: uuid */
            id: string;
            usuario: components["schemas"]["ListarVerificacoesUsuarioResumo"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
            justificativa: string;
            status: components["schemas"]["StatusVerificacao"];
            /** Format: date-time */
            criadaEm: string;
            motivoRecusa: null | string;
        };
        ListarVerificacoesUsuarioResumo: {
            /** Format: uuid */
            id: string;
            nome: string;
            iniciais: string;
        };
        /** @enum {unknown} */
        NivelConcentracao: "baixa" | "media" | "alta";
        ObterAreaIncidentesContagem: {
            /** Format: int16 */
            categoriaId: number;
            nome: string;
            /** Format: int32 */
            dias7: number;
            /** Format: int32 */
            dias30: number;
        };
        ObterAreaIncidentesResponse: {
            /** Format: int32 */
            raioMetros: number;
            /** Format: date-time */
            atualizadoEm: string;
            nivel: components["schemas"]["NivelConcentracao"];
            contagens: components["schemas"]["ObterAreaIncidentesContagem"][];
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
            /** Format: int32 */
            votantes: number;
            /** Format: int32 */
            necessarios: number;
            /** Format: date-time */
            encerraEm: string;
        };
        ObterDetalheProblemaResponse: {
            /** Format: uuid */
            id: string;
            categoria: components["schemas"]["CategoriaResumo"];
            descricao: null | string;
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            endereco: string;
            /** Format: date-time */
            criadoEm: string;
            status: components["schemas"]["StatusProblema"];
            /** Format: double */
            confianca: null | number;
            faixa: null | components["schemas"]["FaixaConfianca"];
            avaliacao: null | components["schemas"]["ObterDetalheProblemaAvaliacao"];
            votos: components["schemas"]["ObterDetalheProblemaVotos"];
            meuVoto: null | components["schemas"]["ValorVotoContrato"];
            souAutor: boolean;
        };
        ObterDetalheProblemaVotos: {
            /** Format: int32 */
            sim: number;
            /** Format: int32 */
            nao: number;
            /** Format: int32 */
            naoUltimas24h: number;
        };
        ObterHistoricoItem: {
            tipo: components["schemas"]["ObterHistoricoTipoItem"];
            /** Format: uuid */
            ocorrenciaId: null | string;
            categoria: components["schemas"]["CategoriaResumo"];
            endereco: null | string;
            valor: null | components["schemas"]["ObterHistoricoValorItem"];
            statusProblema: null | components["schemas"]["StatusProblema"];
            /** Format: date-time */
            data: string;
        };
        /** @enum {unknown} */
        ObterHistoricoTipoItem: "registroProblema" | "registroIncidente" | "voto";
        /** @enum {unknown} */
        ObterHistoricoValorItem: "sim" | "nao";
        ObterMeResponse: {
            /** Format: uuid */
            id: string;
            nome: string;
            email: string;
            perfil: components["schemas"]["Perfil"];
            /** Format: date-time */
            criadoEm: string;
            /** Format: date-time */
            verificadoEm: string | null;
            /** Format: int32 */
            totalRegistros: number;
            /** Format: int32 */
            totalVotos: number;
            verificacao: null | components["schemas"]["ObterMeVerificacaoResumo"];
        };
        ObterMeVerificacaoResumo: {
            status: components["schemas"]["StatusVerificacao"];
            tipoVinculo: components["schemas"]["TipoVinculo"];
            motivoRecusa: null | string;
            /** Format: date-time */
            criadaEm: string;
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
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
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
            /** Format: double */
            lat: number;
            /** Format: double */
            lng: number;
            descricao: null | string;
        };
        RespostaAuth: {
            token: string;
            /** Format: date-time */
            expiraEm: string;
            usuario: components["schemas"]["RespostaAuthUsuarioResumo"];
        };
        RespostaAuthUsuarioResumo: {
            /** Format: uuid */
            id: string;
            nome: string;
            email: string;
            perfil: components["schemas"]["Perfil"];
        };
        ReversaResponse: {
            disponivel: boolean;
            endereco: string;
            logradouro: null | string;
            numero: null | string;
            bairro: null | string;
            cidade: null | string;
            uf: null | string;
            rotuloArea: null | string;
        };
        SolicitarVerificacaoRequest: {
            tipoVinculo: components["schemas"]["TipoVinculo"];
            justificativa: string;
        };
        SolicitarVerificacaoResponse: {
            /** Format: uuid */
            id: string;
            tipoVinculo: components["schemas"]["TipoVinculo"];
            justificativa: string;
            status: components["schemas"]["StatusVerificacao"];
            /** Format: date-time */
            criadaEm: string;
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
            valor: components["schemas"]["ValorVotoContrato"];
            /** Format: double */
            lat: null | number;
            /** Format: double */
            lng: null | number;
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
