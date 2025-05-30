import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api", // Substitua pela URL da sua API
  timeout: 5000,
});
