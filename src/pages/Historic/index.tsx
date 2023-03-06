import { Box } from '@mui/system'
import React, { useEffect, useRef, useState } from 'react'
import { HistoricList } from '../../components/HistoricList'
import { VideoList } from '../../components/VideoList'
import { useLoading } from '../../context/loading_context'
import { getHistoricVideos, HistoricData } from '../../services/video'

export const Historic = () => {
    const [historic, setHistoric] = useState<HistoricData[]>([])
    const [page, setPage] = useState(1)
    const rows = useRef(20)
    const loading = useLoading()

    useEffect(() => {
        getHistoric(page)
      }, [])
    
      const getHistoric = async (page: number) => {
        loading.show()
        try {
            const res = await getHistoricVideos(page, rows.current)
            const newHistoric = historic
            newHistoric.push(...res)
            setHistoric(newHistoric)
        } catch (error) {
            
        }
        loading.hide()
      }

  return (
    <Box sx={{width: '100%', p: '10px'}}>
        <HistoricList
        historicData={historic}
        flexDirection='row'
        rows={rows.current}
        showCreatorName={true}
        changePage={() => {
            setPage(prev => prev+1)
            getHistoric(page+1)
        }}
        />
    </Box>
  )
}
