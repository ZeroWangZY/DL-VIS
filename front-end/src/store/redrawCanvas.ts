import React from 'react';

const context = {
    invokeUpdateRect: () => {},
    setInvokeUpdateRect: (draw) => {
        context.invokeUpdateRect = draw;
    }
};

export const UpdateRectInCanvasContext = React.createContext(context);