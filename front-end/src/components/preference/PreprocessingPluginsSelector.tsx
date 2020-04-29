import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { useGlobalConfigurations, modifyGlobalConfigurations, GlobalConfigurationsModificationType } from '../../store/global-configuration'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2)
    },
    content: {
      margin: theme.spacing(1),
      maxHeight: 400,
      flexGrow: 1,
      maxWidth: 400,
      textAlign: 'left',
      overflow: 'auto'
    },
  }),
);

const descriptions = {
  pruneByOutput: "只保留正向子图",
  replaceVariable: "Variable替换",
  pruneByDefaultPatterns: "按规则裁剪",
  renameVariable: "Variable重命名"
}

export default function PreprocessingPluginsSelector() {
  const classes = useStyles();
  const { preprocessingPlugins } = useGlobalConfigurations()
  const handleChange = (key) => () => {
    modifyGlobalConfigurations(GlobalConfigurationsModificationType.TOGGLE_PREPROCESSING_PLUGIN, 
      key)
  };

  return (
    <div className={classes.container}>
      <Typography>
        图处理方式选择
      </Typography>
      <div className={classes.content}>
        {Object.keys(descriptions).map(
          key => (<FormControlLabel
            key={key} control={<Switch checked={preprocessingPlugins[key]} onChange={handleChange(key)} />}
            label={descriptions[key]}
          />)
        )}

      </div>
    </div>

  );
}
