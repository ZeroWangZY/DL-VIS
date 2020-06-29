import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { NodeType, LayerType } from '../../common/graph-processing/stage2/processed-graph'

interface Props {
  isPopoverOpen: boolean;
  anchorEl: any;
  currentNodetype: number;
  handleClosePopoverWithoutDeselect: { (): void };
  handleClosePopover: { (): void };
  handleAggregate: { (): void };
  handleUngroup: { (): void };
  handleNodetypeChange: { (e: any): void };
  currentLayertype: string;
  handleLayertypeChange: { (e: any): void };
  currentShowLineChart: boolean;
  handleLineChartToggle: { (e: any): void };
  handleModifyNodetype: { (): void };
  handleEnterLayer: { (): void };
  isPathFindingMode?: boolean;
  handleSetStart?: { (): void };
  handleSetEnd?: { (): void }
}

const PopoverBox: React.FC<Props> = (props: Props) => {
  const {
    isPopoverOpen,
    anchorEl,
    currentNodetype,
    handleClosePopoverWithoutDeselect,
    handleClosePopover,
    handleAggregate,
    handleUngroup,
    handleNodetypeChange,
    currentLayertype,
    handleLayertypeChange,
    currentShowLineChart,
    handleLineChartToggle,
    handleModifyNodetype,
    handleEnterLayer,
    isPathFindingMode,
    handleSetStart,
    handleSetEnd
  } = props;

  return (
    <div className={'popover-box'}>
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={currentNodetype < 0 ? handleClosePopoverWithoutDeselect : handleClosePopover}//多选时关闭不取消已勾选项
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {isPathFindingMode ? <Card>
          <CardContent style={{ width: 190 }}>
            <Typography
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: 'center'
              }}
            >Path Finding Options
          </Typography><Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                width: '100%',
                fontSize: 14,
                marginBottom: 5
              }}
              onClick={handleSetStart}
            >
              Set as start
          </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                width: '100%',
                fontSize: 14,
                marginBottom: 5
              }}
              onClick={handleSetEnd}
            >
              Set as end
          </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                width: '100%',
                fontSize: 14,
                marginBottom: 5
              }}
              onClick={handleClosePopover}
            >
              Cancel
          </Button>
          </CardContent>
        </Card>
          : <Card>
            <CardContent style={{ width: 190 }}>
              <Typography
                // variant="h5"
                // component="h2"
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 10,
                  textAlign: 'center'
                }}
              >
                Modification Options
            </Typography>
              {currentNodetype < 0 ?
                <div id="group-aggre-container">
                  <TextField
                    id="group-name-input"
                    label="Group Name"
                    variant="filled"
                    size="small"
                    style={{
                      width: '100%',
                      marginBottom: 10
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    style={{
                      width: '100%',
                      fontSize: 14,
                      marginBottom: 5
                    }}
                    onClick={handleAggregate}
                  >
                    Aggregate
                </Button>
                </div> :
                <div id="type-modify-container">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    style={{
                      width: '100%',
                      fontSize: 14,
                      marginBottom: 10
                    }}
                    onClick={handleUngroup}
                  >
                    Ungroup
                </Button>
                  <div id="nodetype-modify-container">
                    <InputLabel id="nodetype-selector" style={{ fontSize: 10 }}>Node Type</InputLabel>
                    <Select
                      value={currentNodetype}
                      onChange={handleNodetypeChange}
                      style={{
                        width: '100%',
                        marginBottom: 10,
                        fontSize: 14
                      }}
                    >
                      <MenuItem value={NodeType.LAYER}>layer Node</MenuItem>
                      <MenuItem value={NodeType.GROUP}>group Node</MenuItem>
                    </Select>
                  </div>
                  {currentNodetype === NodeType.LAYER &&
                    <div id="layertype-modify-container">
                      <InputLabel id="layertype-selector" style={{ fontSize: 10 }}>Layer Type</InputLabel>
                      <Select
                        value={currentLayertype}
                        onChange={handleLayertypeChange}
                        style={{
                          width: '100%',
                          marginBottom: 10,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value={LayerType.CONV}>CONV</MenuItem>
                        <MenuItem value={LayerType.RNN}>RNN</MenuItem>
                        <MenuItem value={LayerType.FC}>FC</MenuItem>
                        <MenuItem value={LayerType.OTHER}>OTHER</MenuItem>
                      </Select>
                    </div>
                  }
                  {currentNodetype === NodeType.LAYER &&
                    <div id="showLineChart-modify-container">
                      <InputLabel id="showLineChart-selector" style={{ fontSize: 10 }}>Show LineChart</InputLabel>
                      <Select
                        value={currentShowLineChart}
                        onChange={handleLineChartToggle}
                        style={{
                          width: '100%',
                          marginBottom: 10,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value={"true"}>true</MenuItem>
                        <MenuItem value={"false"}>false</MenuItem>
                      </Select>
                    </div>
                  }
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    style={{
                      width: '100%',
                      fontSize: 14,
                      marginBottom: 5
                    }}
                    onClick={handleModifyNodetype}
                  >
                    Apply
                </Button>
                </div>
              }
              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{
                  width: '100%',
                  fontSize: 14,
                  marginBottom: 5
                }}
                onClick={handleEnterLayer}
              >
                Layer-level
                </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{
                  width: '100%',
                  fontSize: 14
                }}
                onClick={handleClosePopover}
              >
                Cancel
            </Button>
            </CardContent>
          </Card>}
      </Popover>
    </div>
  );
}

export default PopoverBox;