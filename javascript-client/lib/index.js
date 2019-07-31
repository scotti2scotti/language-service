"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const request_1 = tslib_1.__importDefault(require("request"));
exports.DefautlOptions = {
    protocol: 'http',
    host: 'localhost',
    port: 5656
};
const settings = () => {
    const { LS_PROTOCOL, LS_HOST, LS_PORT } = process.env;
    if (!LS_HOST || !LS_PORT || !LS_PROTOCOL) {
        console.warn("Missing environment variable(s)");
        return exports.DefautlOptions;
    }
    return {
        protocol: LS_PROTOCOL === 'https' ? 'https' : 'http',
        host: LS_HOST,
        port: +LS_PORT,
    };
};
class Client {
    constructor(options = settings()) {
        // POST /?url
        this.url = async (url) => {
            return new Promise((resolve, reject) => {
                const cb = this.callback(resolve, reject);
                const endpoint = `${this.path()}?url=${url}`;
                request_1.default.post(endpoint, cb);
            });
        };
        // POST /stream
        this.stream = async (stream) => {
            return new Promise((resolve, reject) => {
                const cb = this.callback(resolve, reject);
                const endpoint = this.path('stream');
                stream.pipe(request_1.default.post(endpoint, cb));
            });
        };
        this.callback = (resolve, reject) => {
            return (error, { statusCode }, body) => {
                const ok = statusCode === 200 && !error;
                if (ok) {
                    resolve(body);
                }
                else {
                    reject(!!error ? error : new Error(body));
                }
            };
        };
        this.path = (...segments) => [this.service, ...segments].join('/');
        const { protocol, host, port } = options;
        this.service = `${protocol}://${host}:${port}`;
    }
}
exports.Client = Client;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQWtEO0FBeUJyQyxRQUFBLGNBQWMsR0FBa0I7SUFDM0MsUUFBUSxFQUFFLE1BQU07SUFDaEIsSUFBSSxFQUFFLFdBQVc7SUFDakIsSUFBSSxFQUFFLElBQUk7Q0FDWCxDQUFBO0FBRUQsTUFBTSxRQUFRLEdBQUcsR0FBa0IsRUFBRTtJQUNuQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFBO0lBQ3JELElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sc0JBQWMsQ0FBQTtLQUN0QjtJQUNELE9BQU87UUFDTCxRQUFRLEVBQUUsV0FBVyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ3BELElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxFQUFFLENBQUMsT0FBTztLQUNmLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFhLE1BQU07SUFHakIsWUFBbUIsVUFBeUIsUUFBUSxFQUFFO1FBS3RELGFBQWE7UUFDRyxRQUFHLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBeUIsRUFBRTtZQUNqRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNyQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDekMsTUFBTSxRQUFRLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsR0FBRyxFQUFFLENBQUE7Z0JBQzVDLGlCQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUM1QixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUVELGVBQWU7UUFDQyxXQUFNLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBeUIsRUFBRTtZQUN2RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNyQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUN6QyxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQUVPLGFBQVEsR0FBRyxDQUFDLE9BQWUsRUFBRSxNQUFjLEVBQW1CLEVBQUU7WUFDdEUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNyQyxNQUFNLEVBQUUsR0FBRyxVQUFVLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO2dCQUN2QyxJQUFJLEVBQUUsRUFBRTtvQkFDTixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ2Q7cUJBQU07b0JBQ0wsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtpQkFDMUM7WUFDSCxDQUFDLENBQUE7UUFDSCxDQUFDLENBQUE7UUFFZ0IsU0FBSSxHQUFHLENBQUMsR0FBRyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFqQ3RGLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQTtRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsUUFBUSxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQTtJQUNoRCxDQUFDO0NBZ0NGO0FBdENELHdCQXNDQyJ9