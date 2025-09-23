import axios from "axios";

const applicationProgrammingInterfaceBaseUniformResourceLocator =
  import.meta.env.VITE_API_URL || "http://localhost:3002";

const applicationProgrammingInterfaceClient = axios.create({
  baseURL: applicationProgrammingInterfaceBaseUniformResourceLocator,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

export default applicationProgrammingInterfaceClient;
