import {useState} from 'react'

function usePost(url: string){
    const [loading,setLoading] = useState(false)
    const [error, setError] = useState(false)

    const sendDataToServer = async(data: any)=>{
        setLoading(true)
        setError(false)
        try{
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            return await res.json()
        } catch(error) {
            setError(true)
            throw new Error("Unable to POST data, please check usePost")
        } finally {
            setLoading(false)
        }
    }

    return {sendDataToServer, loading, error}
}

export default usePost