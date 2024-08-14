export type Deps = {
    [files: string]: {
        module: string;
        tags: string[];
        imports: string[];
    }
};
