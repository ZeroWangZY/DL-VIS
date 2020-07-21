package com.zju.elkgraph.utils;

import java.util.HashMap;
import java.util.Map;

import org.eclipse.elk.alg.layered.options.CrossingMinimizationStrategy;
import org.eclipse.elk.alg.layered.options.LayeredOptions;
import org.eclipse.elk.alg.layered.options.NodePlacementStrategy;
import org.eclipse.elk.core.options.CoreOptions;
import org.eclipse.elk.core.options.HierarchyHandling;
import org.eclipse.elk.core.options.PortAlignment;
import org.eclipse.elk.graph.properties.IProperty;

public class ELKUtils {
	public static Map<String, IProperty> optionKey = new HashMap<String, IProperty>() {{
		put("org.eclipse.elk.layered.nodePlacement.strategy", LayeredOptions.NODE_PLACEMENT_STRATEGY);
		put("org.eclipse.elk.portAlignment.east", LayeredOptions.PORT_ALIGNMENT_EAST);
		put("org.eclipse.elk.portAlignment.west", LayeredOptions.PORT_ALIGNMENT_WEST);
		put("org.eclipse.elk.layered.nodePlacement.favorStraightEdges", LayeredOptions.NODE_PLACEMENT_FAVOR_STRAIGHT_EDGES);
		put("org.eclipse.elk.layered.crossingMinimization.strategy", LayeredOptions.CROSSING_MINIMIZATION_STRATEGY);
		put("org.eclipse.elk.interactive", CoreOptions.INTERACTIVE);
		put("org.eclipse.elk.hierarchyHandling", LayeredOptions.HIERARCHY_HANDLING);
		put("org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers", LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS);
	}};
	public static Map<String, Object> optionValue = new HashMap<String, Object>() {{
		put("org.eclipse.elk.layered.nodePlacement.strategy", NodePlacementStrategy.NETWORK_SIMPLEX);
		put("org.eclipse.elk.portAlignment.east", PortAlignment.CENTER);
		put("org.eclipse.elk.portAlignment.west", PortAlignment.CENTER);
		put("org.eclipse.elk.layered.nodePlacement.favorStraightEdges", true);
		put("org.eclipse.elk.layered.crossingMinimization.strategy", CrossingMinimizationStrategy.LAYER_SWEEP);
		put("org.eclipse.elk.interactive", true);
		put("org.eclipse.elk.hierarchyHandling", HierarchyHandling.INCLUDE_CHILDREN);
		put("org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers", 50.0);
	}};
}
