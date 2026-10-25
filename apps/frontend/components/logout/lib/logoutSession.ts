import { env } from "@/lib/env";

const API_URL =env.API_URL

export async function logoutSession(){
        if(!API_URL){
            throw new Error("API URL is not configured.");
        }
        const response = await fetch(`${API_URL}/logout`,{
            method: "POST",
            credentials: "include",
        })

        if(!response.ok){
            throw new Error("Unable to log out. Please try again.")
        }
}