import * as d3 from "d3";

const TENSOR_SHAPE_DELIM = '×';

/** The minimum stroke width of an edge. */
export const MIN_EDGE_WIDTH = 0.75;

/** The maximum stroke width of an edge. */
export const MAX_EDGE_WIDTH = 12;

/** The exponent used in the power scale for edge thickness. */
const EDGE_WIDTH_SCALE_EXPONENT = 0.3;

/** The domain (min and max value) for the edge width. */
const DOMAIN_EDGE_WIDTH_SCALE = [1, 5E6];

export const EDGE_WIDTH_SCALE: d3.ScalePower<number, number> = d3.scalePow()
  .exponent(EDGE_WIDTH_SCALE_EXPONENT)
  .domain(DOMAIN_EDGE_WIDTH_SCALE)
  .range([MIN_EDGE_WIDTH, MAX_EDGE_WIDTH])
  .clamp(true);