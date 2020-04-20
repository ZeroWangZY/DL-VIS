import { scaleLinear } from 'd3-scale';
export const computeXYScales= (
    _series,
    width,
    height
  ) => {
    const series = _series.map(serie => ({
        ...serie,
        data: serie.data.map(d => ({ data: { ...d } })),
      }));
    let xy = generateSeriesXY(series); 
    //  console.log(xy)
    const xScale = linearScale('x', xy, width, height);
    const yScale = linearScale('y', xy, width, height); 
    // debugger 
    series.forEach(serie => {
        serie.data.forEach(d => {
          d.position = [xScale(d.data.x), yScale(d.data.y)];
        });
      });
    
      return {
        ...xy,
        series,
        xScale,
        yScale,
      };    
}
export const generateSeriesXY = (series) => ({
    x: generateSeriesAxis(series, 'x'),
    y: generateSeriesAxis(series, 'y'),
  });
export const generateSeriesAxis = (series, axis) => {
    let all = [];
    series.forEach(serie => {
      serie.data.forEach(d => {
        all.push(d.data[axis]);
      });
    });
    let min, max;
    min = Math.min(...all);
    max = Math.max(...all);
    return { all, min, max };
};
export const linearScale = (
    axis,
    xy,
    width,
    height
  ) => {
    const values = xy[axis];
    const size = axis === 'x' ? width : height;
  
    let minValue = values.min;
    let maxValue = values.max;
    maxValue = axis === 'y' ? parseInt(maxValue * 1.2): maxValue;
 
    const scale = scaleLinear()
      .rangeRound(axis === 'x' ? [0, size] : [size, 0])
      .domain([minValue, maxValue]);
  
    scale.type = 'linear';
    return scale;
  };