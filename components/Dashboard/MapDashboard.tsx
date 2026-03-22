import Image from "next/image"

export function MapDashboard(props:object){
    return (
        <section
            className="h-screen w-[300px]"
        >
            <Image
                src={`${props.image}`}
                alt="Place Image"
                width={300}
                height={300}
            />
            <h2>
                {props.heading}
            </h2>
            <p>
                {props.rating}
            </p>
        </section>
    )
}