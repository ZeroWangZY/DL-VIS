import { useState, useEffect } from 'react'

let listeners = []
let showLineChart: boolean = true;

// 广播变化, 让使用了该hook的组件重新渲染
export const broadcastToggleChange = () => {
    listeners.forEach(listener => {
        listener(showLineChart)
    });
}

export const setToggleForLineChart = (newToggleState: boolean) => {
    showLineChart = newToggleState
    broadcastToggleChange()
}

export const useToggleForLineChart = () => {
    const [ToggleState, newListener] = useState(showLineChart)

    useEffect(() => {
        listeners.push(newListener)
        return () => {
            listeners = listeners.filter(listener => listener !== newListener)
        }
    }, [])
    return ToggleState
}
