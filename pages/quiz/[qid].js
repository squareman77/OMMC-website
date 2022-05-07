const fs = require("fs")
import renderMathInElement from "katex/dist/contrib/auto-render.js"
import { useState, useEffect } from 'react'
import XMLHttpRequest from 'xhr2'

export default ({ qid, err, pdf }) => {
    const [isSSR, setIsSSR] = useState(true)

    useEffect(() => {
	    setIsSSR(false)
    }, [])

    const options = { //latex
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\begin{equation}", right: "\\end{equation}", display: true},
            {left: "\\begin{align}", right: "\\end{align}", display: true},
            {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
            {left: "\\begin{gather}", right: "\\end{gather}", display: true},
            {left: "\\begin{CD}", right: "\\end{CD}", display: true},
            {left: "\\[", right: "\\]", display: true}
        ]
    }

    if (!isSSR)
        window.WebFontConfig = { // more latex
            custom: {
                families: ['KaTeX_AMS', 'KaTeX_Caligraphic:n4,n7', 'KaTeX_Fraktur:n4,n7',
                    'KaTeX_Main:n4,n7,i4,i7', 'KaTeX_Math:i4,i7', 'KaTeX_Script',
                    'KaTeX_SansSerif:n4,n7,i4', 'KaTeX_Size1', 'KaTeX_Size2', 'KaTeX_Size3',
                    'KaTeX_Size4', 'KaTeX_Typewriter'],
            },
        }

    function Attachment(s) {
        if (s.attached?.type === `image`) {
            return <img src={s.attached?.src} className="mx-auto"/> 
        }
    }

    function submit(ovrride) {
        if (isSSR) return;

        let unansPopup = document.getElementById("unanswered")
        let unanswered = false
        const answers = [...document.querySelectorAll(".inputs")].map(e => {
            if (e.value === "")
                unanswered = true
            return e.value.trim()
        })

        if (ovrride)
            unanswered = false

        if (unanswered) {
            unansPopup.showModal() //make them sad
            return
        }
        
        fetch(`${process.env.NEXT_PUBLIC_URL}/api/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: qid.id,
                answers: answers
            })
        })
        
        location.href = "/success"
    }

    if (err)
        return <>
            <div id = "screen" className='w-screen h-screen text-center'>
                <h1 className="text-center text-red-500 font-bold text-8xl"> An error has occurred. </h1>
                <p className="text-4xl">{err}</p>
            </div>
        </>
    
    return <>
        <style global jsx>{`
            html,
            body,
            div#__next {
                height: 100vh;
                background-color: #ab3942;
            }
        `}</style>
        
        <div id = "screen" className='w-screen h-screen text-center'>
            <div className="border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto my-8 py-1">
                <h1 className="text-center font-semibold text-4xl mb-2">Instructions:</h1>
                {qid.instructions?.map(i => 
                    <p className="text-center text-2xl">{i}</p>
                ) ?? <>
                    <p className="text-center text-2xl">just answer the questions lol</p>
                    <p className="text-center text-2xl">do yo best</p>
                </>}
            </div>
            
            {qid.pdf && <object
                data={`data:application/pdf;base64,${pdf}#toolbar=0&navpanes=0`}
                type="application/pdf"
                className="w-3/5 h-2/3 mx-auto"
            >
                <a className="block border-4 border-solid border-gray-300 bg-white rounded-lg w-2/3 mx-auto text-center my-16 font-semibold py-1 px-1 text-3xl" href={qid.pdf}>Click here to download the PDF file with questions.</a>
            </object>}

            <div className='text-center block flex items-center justify-center my-16'>
                <div className='border-4 border-solid border-gray-300 rounded-lg w-2/3 bg-white py-2 px-4'>
                    <p className='text-2xl my-2 text-center w-full mx-auto'> Please enter name and team (if applicable). </p>
                    <input type="text" placeholder="Ex. Sarthak - Cyclic Quadrilateral" className="inputs outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid"/>
                </div>
            </div>
            {
                qid.questions.map((s, i) => 
                    <div className='text-center block flex items-center justify-center my-16' key={`container-${i}`}>
                        <div className='border-4 border-solid border-gray-300 rounded-lg w-2/3 bg-white py-2 px-4' key={`div-${i}`}>
                            <h2 className='text-3xl font-semibold' key={`qnum-${i}`}>Q{i+1}</h2>
                            {!qid.pdf && <p className='text-2xl my-2 text-center w-full mx-auto' id = {`katex-outp-${i}`} key={`q-${i}`}> {s.question} </p>}
                            {!isSSR && !qid.pdf && renderMathInElement(document.getElementById(`katex-outp-${i}`), options)}

                            {Attachment(s)}

                            {s.type === "long" && <textarea type="text" className="inputs outline-none w-full text-2xl p-3 border-4 my-4 border-gray-300 border-solid" key={`inp-${i}`}/>}
                            {s.type === "short" && <input type="text" className="inputs outline-none w-full text-4xl p-3 border-4 my-4 border-gray-300 border-solid" key={`inp-${i}`}/>}
                            {/* <form className="text-left">
                                {
                                    ["1", "1/2", "3", "5"].map((e, i) => <div key={`${i}`}>
                                        <input type="radio" id={`${i}`} name = "question"/>
                                        <label for={`${i}`} className="mx-2 text-xl">{e}</label>
                                    </div>)
                                }
                            </form> */}
                        </div>
                    </div>
                )
            }
            <dialog className="border-4 border-solid border-gray-300 bg-white rounded-lg" id="unanswered">
                <p className="text-xl font-semibold">Some questions have not been answered.</p>
                <form method="dialog">
                    <button className='ml-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-sky-500 hover:bg-sky-600 my-4 text-2xl transition duration-150' value="cancel">Close</button>
                    <button onClick={() => submit(true)} className='ml-4 mr-auto drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150'>Submit Anyways</button>
                </form>
            </dialog>
            <button onClick={() => submit(false)} className='drop-shadow-lg active:drop-shadow-none active:bottom-0 bottom-0.5 relative rounded-full py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 my-4 text-2xl transition duration-150'>Submit</button>
        </div>
    </>
}

function base64Encode(str) {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
} // <- haha look at this i am definitely not dying inside

function getBinary(file){
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file, true);
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.onload = () => {
            res(xhr.responseText);
        }
        xhr.send();
    })
}

export async function getServerSideProps({ params }) {
    let test = null

    try {
        test = await fs.promises.readFile(`../tests/${params.qid}.json`)
        test = JSON.parse(test)

        let b64pdf = null;
        if (test?.pdf) {
            b64pdf = await getBinary(test.pdf)
            b64pdf = base64Encode(b64pdf)
        }

        return {
            props: {
                qid: test,
                pdf: b64pdf
            }
        }
    } catch (error) {
        return {
            props: {
                err: `${error}`
            }
        }
    }
}
