import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { useGlobalConfigurations, modifyGlobalConfigurations } from '../../store/global-configuration'
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";

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

export default function ConceptualGraphMode() {
  const classes = useStyles();
  const { conceptualGraphMode } = useGlobalConfigurations()
  const handleChange = () => {
    modifyGlobalConfigurations(GlobalConfigurationsModificationType.TOGGLE_CONCEPTUALGRAPH_MODE)
  };

  return (
    <div className={classes.container}>
      <Typography>
        Conceptual Graph Mode
      </Typography>
      <div
        className={classes.content}
      >
        <FormControlLabel
          control={<Switch checked={conceptualGraphMode} onChange={handleChange} />}
          label={"概念图模式"}
        />
      </div>
    </div>
  );
}
