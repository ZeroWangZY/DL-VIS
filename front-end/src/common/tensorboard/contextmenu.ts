import * as d3 from "d3";
import * as graphlib from 'graphlib'
const _ = require('lodash')


/** Function that converts data to a title string. */
export interface TitleFunction {
  (data: any): string;
}

/** Function that takes action based on item clicked in the context menu. */
export interface ActionFunction {
  (elem: any, d: any, i: number): void;
}

/**
 * The interface for an item in the context menu
 */
export interface ContextMenuItem {
  title: TitleFunction;
  action: ActionFunction;
}

/**
 * Returns the event listener, which can be used as an argument for the d3
 * selection.on function. Renders the context menu that is to be displayed
 * in response to the event.
 */
export function getMenu(menu: ContextMenuItem[]) {
  let menuSelection = d3.select('.context-menu');
  // Close the menu when anything else is clicked.
  d3.select('body').on(
    'click.context', function () { menuSelection.style('display', 'none'); });

  // Function called to populate the context menu.
  return function (data, index: number): void {
    // Position and display the menu.
    let event = d3.event;
    menuSelection
      .style('display', 'block')
      .style('left', (event.layerX + 1) + 'px')
      .style('top', (event.layerY + 1) + 'px');

    // Stop the event from propagating further.
    event.preventDefault();
    event.stopPropagation();

    // Add provided items to the context menu.
    menuSelection.html('');
    let list = menuSelection.append('ul');
    list.selectAll('li')
      .data(menu)
      .enter()
      .append('li')
      .html(function (d) { return d.title(data); })
      .on('click', (d, i) => {
        d.action(this, data, index);
        menuSelection.style('display', 'none');
      });
  };
};

