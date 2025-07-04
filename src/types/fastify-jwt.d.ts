import "@fastify/jwt";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            idassessor?: number;
	    assessor?: string;	
            admin?: boolean;
            idusuario?: number;
            usuario?: string;
            idorganizacao?: number;
            organizacao?: string;
        };
        user: {
            idassessor?: number;
	    assessor?: string;
            admin?: boolean;
            idusuario?: number;
            usuario?: string;
            idorganizacao?: number;
            organizacao?: string;
        };
    }
}
