package com.zju.elkgraph.controller;

import java.util.Iterator;

import org.eclipse.elk.alg.layered.graph.Layer;
import org.eclipse.elk.alg.layered.options.CrossingMinimizationStrategy;
import org.eclipse.elk.alg.layered.options.LayeredMetaDataProvider;
import org.eclipse.elk.alg.layered.options.LayeredOptions;
import org.eclipse.elk.alg.layered.options.NodePlacementStrategy;
import org.eclipse.elk.core.RecursiveGraphLayoutEngine;
import org.eclipse.elk.core.data.LayoutMetaDataService;
import org.eclipse.elk.core.options.CoreOptions;
import org.eclipse.elk.core.options.HierarchyHandling;
import org.eclipse.elk.core.options.PortAlignment;
import org.eclipse.elk.core.service.DiagramLayoutEngine;
import org.eclipse.elk.core.util.BasicProgressMonitor;
import org.eclipse.elk.graph.ElkEdgeSection;
import org.eclipse.elk.graph.ElkNode;
import org.eclipse.elk.graph.impl.ElkEdgeSectionImpl;
import org.eclipse.elk.graph.json.ElkGraphJson;
import org.eclipse.elk.graph.properties.IProperty;
import org.eclipse.emf.common.util.EList;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.support.spring.PropertyPreFilters;
import com.alibaba.fastjson.JSONObject;
import com.google.gson.JsonObject;
import com.zju.elkgraph.utils.ELKUtils;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class ELKController {

	@RequestMapping(value = "/api/elk_layout", method = RequestMethod.POST)
	@ResponseBody
	public String elk_layout(@RequestBody JSONObject graphObject) {

		log.info("elk_layout接口被调用...");
		
		String graphStr = graphObject.getJSONObject("graph").toJSONString();
		JSONObject options = graphObject.getJSONObject("options");
		
		ElkNode elkgraph = ElkGraphJson.forGraph(graphStr).toElk();
		
		LayoutMetaDataService service = LayoutMetaDataService.getInstance();

		Iterator it = (Iterator) options.keySet().iterator();

		while (it.hasNext()) {
			String keyStr = (String) it.next();
			if (keyStr.equals("org.eclipse.elk.algorithm")) {
				if (options.get(keyStr).equals("layered")) {
					// 设置algorithm为layered
					service.registerLayoutMetaDataProviders(new LayeredMetaDataProvider());
				}
			} else {
				IProperty optionkey = (IProperty) ELKUtils.optionKey.get(keyStr);
				Object optionValue = ELKUtils.optionValue.get(keyStr);
				if (keyStr.equals("org.eclipse.elk.layered.nodePlacement.strategy")) {
					if (options.get(keyStr).equals("INTERACTIVE")) {
						optionValue = NodePlacementStrategy.INTERACTIVE;
					}
				}
				elkgraph.setProperty(optionkey, optionValue);
			}
		}
		
		BasicProgressMonitor progressMonitor = new BasicProgressMonitor();
		RecursiveGraphLayoutEngine engine = new RecursiveGraphLayoutEngine();
		engine.layout(elkgraph, progressMonitor);

		return ElkGraphJson.forGraph(elkgraph).omitLayout(false).omitZeroDimension(false).omitZeroPositions(false)
				.shortLayoutOptionKeys(false).prettyPrint(true).toJson();
	}
}