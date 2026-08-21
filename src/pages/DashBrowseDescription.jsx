import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../utils/AxiosConfig'
import '../styles/DashBrowseDescription.css'
import {DashboardMusicPlayer,DashboardNav,DashboardSidebar} from './Dashboard'

function DashBrowseDescription() {
    let { id } = useParams()
    let [category, setCategory] = useState(null)

    async function FetchCategory() {
        try {
            let response = await api.get("/browseCategory")
            if (response.status === 200) {
                let categories = response.data.browseCategory || []
                let selectedCategory = categories.find((item) => item._id === id)
                setCategory(selectedCategory)
            }
        } catch (e) {
            console.log(e.response)
        }
    }

    useEffect(() => {
        FetchCategory()
    }, [id])

    return (
        <div className='dashboard-page'>
            <DashboardNav />
            <div className='dash-main'>
                <div className='dash-main-left'>
                    <DashboardSidebar />
                </div>
                <div className='dash-main-right'>
                    {
                        category ? (
                            <div className='dash-browse-description'>
                                <div
                                    className='dash-browse-description-header'
                                    style={{backgroundColor:category.color }} >
                                    <h1>{category.title}</h1>
                                </div>

                                <div className='dash-browse-description-content'>
                                    <h2> {category.title} </h2>
                                    <div className='dash-browse-empty'>
                                        <h3> Nothing here yet </h3>
                                        <p>Check back later for more content.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='dash-browse-loading'>
                                <h2>Loading...</h2>
                            </div>
                        )
                    }
                </div>
            </div>
            <DashboardMusicPlayer />
        </div>
    )
}

export default DashBrowseDescription