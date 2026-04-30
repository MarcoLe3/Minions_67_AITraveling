import {useState} from 'react'

export function usePost(url: string | undefined | Request){
    const [loading,setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [data, setData] = useState(null)

    const sendDataToServer = async(data: any)=>{
        setLoading(true)
        setError(false)
        try{
            
            const res = await fetch(url!, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            const json = await res.json()
            setData(json)
            return json
        } catch(error) {
            setError(true)
            throw new Error("Unable to POST data, please check usePost")
        } finally {
            setLoading(false)
        }
    }

    return {sendDataToServer, loading, error, data}
}
