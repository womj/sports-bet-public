import React from "react"
import { SPORTS_MAP } from "./sport-map"

function SportTitle({ sport }) {
    return (
        <section id="header">
            <h1>{sport}</h1>
        </section>
    )
}


export default function SportsLayout({ children, params }) {
    console.log("sport", params.sport)

    const sport = SPORTS_MAP[params.sport]
    if (!sport) {
        return (
            <SportTitle sport="SPORT NOT FOUND" />
        )
    }

    return (
        <>
            <SportTitle sport={params.sport?.toUpperCase()} />
            {children}
        </>
    );
}
