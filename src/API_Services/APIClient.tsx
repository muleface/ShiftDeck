import axios, {AxiosInstance} from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {'Content-Type': 'application/json'}
    }); //this is basically the entire api client, right here. everything below is currently unnecessary / related to error handling for logging purposes.

//interceptors are for both request and response - request interceptors intercept and modify the request before it leaves the vite server, and response interceptors
//intercept the response before other functions can parse it.
api.interceptors.request.use( //taken straight from an AI. I do want to implement some basic security measures later. good for resume.
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    });

api.interceptors.response.use(
    response => { //20x response, which means a valid response. we have no reason to modify it in any way.
        return response;
    },
    error => {
        if (error.response) { //just logging the different error types to console for easy debugging.
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized request');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 400:
                    console.error('Bad Request - ', error.response.data);
                    break;
                case 500:
                    console.error('Server inaccessible');
                    break;
                default:
                    console.error('Error: ', error.response.status);
            }
        } else if (error.request) { //this means that there was a request (hence the conditional is true), and it is conditioned on the fact that there was no error response from the server.
            console.error('No response received from server');
        } else { //weird edgecase with the request itself failing
            console.error(`Shouldn't be here lol - `, error.message);
        }
        return Promise.reject(error); //this tells the fetching functions that the request failed.
    }
    
)

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem("jwt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default api;












