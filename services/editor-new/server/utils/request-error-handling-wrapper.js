export default function requestErrorHandlingWrapper(handler, ...params) {
    return async (req, res) => {
        try {
            await Promise.resolve(handler(req, res, ...params));
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    };
}
