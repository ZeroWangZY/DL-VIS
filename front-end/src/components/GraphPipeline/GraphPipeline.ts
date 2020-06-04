import React, { useState, useEffect } from "react";
import { useGlobalConfigurations } from "../../store/global-configuration";

export default function useGraphPipeline() {

  const { preprocessingPlugins, currentLayout, shouldOptimizeProcessedGraph } = useGlobalConfigurations();


  useEffect(() => {
    
  }, []);


}
