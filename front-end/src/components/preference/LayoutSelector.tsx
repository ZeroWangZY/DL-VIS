import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useGlobalConfigurations, modifyGlobalConfigurations } from '../../store/global-configuration';
import { GlobalConfigurationsModificationType, LayoutType } from "../../store/global-configuration.type";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: '80%'
    },
  }),
);


export default function LayoutSelector() {
  const classes = useStyles();
  const { currentLayout } = useGlobalConfigurations()
  const selections = [
    LayoutType.DAGRE_FOR_TF,
    LayoutType.TENSORBOARD,
    LayoutType.DAGRE_FOR_MS,
    LayoutType.ELK_FOR_TF,
    LayoutType.ELK_FOR_MS
  ]
  const descriptions = ['tf图的dagre布局', 'TensorBoard布局', 'ms图的dagre布局', 'tf图的elk布局', 'ms图的elk布局']

  const handleChange = (event: React.ChangeEvent<{ value: LayoutType }>) => {
    modifyGlobalConfigurations(GlobalConfigurationsModificationType.SET_CURRENT_LAYOUT, event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="layout-selector">current layout</InputLabel>
        <Select
          labelId="layout-selector"
          value={currentLayout}
          onChange={handleChange}
        >
          {selections.map((layoutType, index) =>
            <MenuItem key={index} value={layoutType}>{descriptions[index]}</MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
}
