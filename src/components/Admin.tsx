import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const Admin = () => {
    const [playerCount, setPlayerCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const docRef = doc(db, 'stats', 'players')
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setPlayerCount(docSnap.data().count)
                } else {
                    setPlayerCount(0)
                }
            } catch (e) {
                console.error("Error fetching admin stats:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#111',
            color: '#0f0',
            fontFamily: 'monospace',
            padding: '2rem',
            zIndex: 2000
        }}>
            <h1>PLANETFALL ADMIN</h1>
            <div style={{ marginTop: '2rem', fontSize: '1.5rem', border: '1px solid #333', padding: '1rem', display: 'inline-block' }}>
                <p>Global Unique Players</p>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '1rem' }}>
                    {loading ? '...' : playerCount}
                </div>
            </div>

            <div style={{ marginTop: '2rem', color: '#666' }}>
                <p>Status: {loading ? 'Loading...' : 'Connected'}</p>
            </div>
        </div>
    )
}
