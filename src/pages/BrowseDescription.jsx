import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../utils/AxiosConfig'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import '../styles/BrowseDescription.css'


function BrowseDescription() {
    let { id } = useParams()
    let [category, setCategory] = useState({})

    async function FetchCategory() {
        try {
            let response = await api.get("/browseCategory")
            if (response.status === 200) {
                let categories = response.data.browseCategory || []
                let foundCategory = categories.find(
                    (item) => item._id === id
                )
                if (foundCategory) {
                    setCategory(foundCategory)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        FetchCategory()
    }, [id])

    return (
        <>
            <Header />
            <div className='main'>
                <Sidebar />
                <div className='main-right'>
                    <div className='browse-description'>
                        <div className='browse-description-header' style={{backgroundColor: category.color || '#121212'}}>
                            <h1>{category.title}</h1>
                        </div>

                        <div className='browse-description-line'></div>
                        <div className='browse-description-content'>
                            <h2>{category.title}</h2>

                            <div className='browse-empty'>
                                <h3>Nothing here yet</h3>
                                <p>Check back later for more content.</p>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}

export default BrowseDescription