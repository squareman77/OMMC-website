export default () => {
    return <>
        <style global jsx>{`
            html,
            body,
            div#__next {
                height: 100vh;
                background-color: #ab3942;
            }
        `}</style>
        <div className="mx-auto text-center my-16">
            <h1 className="inline-block text-6xl py-2 px-4 rounded-lg font-semibold bg-white border-4 border-solid border-gray-300">Test successfully submitted.</h1>
            <br/>
            <p className="inline-block my-8 bg-white rounded-lg border-4 border-solid border-gray-300 py-2 px-4 text-3xl">Yay! Results will be released soon!</p>
        </div>
    </>
}
