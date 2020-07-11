import { useEffect } from "react";
import { useGlobalConfigurations } from "../../store/global-configuration";
import { buildMsGraph } from "../../common/graph-processing/stage2/build-graph.ms";
import { useMsRawGraph } from "../../store/rawGraph.ms";
import {
  setProcessedGraph,
  useProcessedGraph,
} from "../../store/processedGraph";
import ProcessedGraphOptimizer from "../../common/graph-processing/stage2/processed-graph-optimizer";
import VisGraphOptimizer from '../../common/graph-processing/stage3/vis-graph-optimizer'
import { useTfRawGraph } from "../../store/rawGraph.tf";
import { buildGraph } from "../../common/graph-processing/stage2/build-graph.tf";
import { produceVisGraph } from "../../common/graph-processing/stage3/produce-vis-graph";
import { produceLayoutGraph } from "../../common/graph-processing/stage4/produce-layout-graph";
import { produceStyledGraph } from "../../common/graph-processing/stage5/produce-styled-graph";
import { setVisGraph, useVisGraph } from "../../store/visGraph";
import { setLayoutGraph, useLayoutGraph } from "../../store/layoutGraph";
import { setStyledGraph } from "../../store/styledGraph";
import { LayoutType } from "../../store/global-configuration.type";


export default function useGraphPipeline() {
  const { shouldOptimizeProcessedGraph, currentLayout, conceptualGraphMode } = useGlobalConfigurations();
  const msRawGraph = useMsRawGraph()
  const tfRawGraph = useTfRawGraph()
  const processedGraph = useProcessedGraph()
  const visGraph = useVisGraph()
  const layoutGraph = useLayoutGraph()
  const { diagnosisMode } = useGlobalConfigurations();

  const isTfGraph =
    currentLayout === LayoutType.DAGRE_FOR_TF ||
    currentLayout === LayoutType.TENSORBOARD ||
    currentLayout === LayoutType.ELK_FOR_TF;

  const isMsGraph =
    currentLayout === LayoutType.DAGRE_FOR_MS ||
    currentLayout === LayoutType.ELK_FOR_MS;

  // RawGraph --> ProcessedGraph
  useEffect(() => {
    if (isMsGraph && msRawGraph) {
      const hGraph = buildMsGraph(msRawGraph);
      if (conceptualGraphMode) {
        const processedGraphOptimizer = new ProcessedGraphOptimizer();
        processedGraphOptimizer.optimize(hGraph);
      }
      setProcessedGraph(hGraph);
    }

    if (isTfGraph && tfRawGraph) {
      buildGraph(tfRawGraph).then((pGraph) => {
        if (conceptualGraphMode) {
          const processedGraphOptimizer = new ProcessedGraphOptimizer();
          processedGraphOptimizer.optimize(pGraph);
        }
        setProcessedGraph(pGraph);
      });
    }
  }, [msRawGraph, tfRawGraph, conceptualGraphMode]);

  // ProcessedGraph --> VisGraph
  useEffect(() => {
    if (!processedGraph) return;

    let vGraph = produceVisGraph(processedGraph, { isDiggingEdgeBundlingMode: true })
    const visGraphOptimizer = new VisGraphOptimizer()
    vGraph = visGraphOptimizer.optimize(vGraph)
    setVisGraph(vGraph)

  }, [processedGraph]);

  // VisGraph --> layoutGraph
  useEffect(() => {
    if (!visGraph) return;
    const lGraph = produceLayoutGraph(visGraph, { networkSimplex: true, fixedNodeHeight: diagnosisMode });
    lGraph.then(result => {
      setLayoutGraph(result);
    })

  }, [visGraph, diagnosisMode]);

  // layoutGraph --> StyledGraph
  useEffect(() => {
    if (!layoutGraph) return;
    const sGraph = produceStyledGraph(layoutGraph);
    setStyledGraph(sGraph);
  }, [layoutGraph]);
}
