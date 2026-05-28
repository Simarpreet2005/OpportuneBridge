const formatMeta = (meta) => {
    if (!meta || Object.keys(meta).length === 0) return "";
    return ` ${JSON.stringify(meta)}`;
};

export const logger = {
    info(message, meta = {}) {
        console.info(`[info] ${message}${formatMeta(meta)}`);
    },
    warn(message, meta = {}) {
        console.warn(`[warn] ${message}${formatMeta(meta)}`);
    },
    error(message, meta = {}) {
        console.error(`[error] ${message}${formatMeta(meta)}`);
    }
};
