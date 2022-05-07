import Head from 'next/head'
import Main from '../components/Main.js'
import Navbar from '../components/Navbar.js'
import Footer from '../components/Footer.js'
import Banner from '../components/Banner.js'

function App() {


    return (<>
        <Head>
            <title>OMMC</title>
        </Head>

        <Navbar></Navbar>
        <Banner></Banner>

        <Main />

        <Footer></Footer>

    </>
    )
}

export default App;