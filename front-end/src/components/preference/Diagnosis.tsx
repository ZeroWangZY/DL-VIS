import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { GroupNode, NodeId, NodeType } from '../../types/processed-graph';
import { useToggleForLineChart, broadcastToggleChange, setToggleForLineChart} from '../../store/toggleForLineChart'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            marginTop: theme.spacing(2)
        },
        treeView: {
            margin: theme.spacing(1),
            maxHeight: 400,
            flexGrow: 1,
            maxWidth: 400,
            textAlign: 'left',
            overflow: 'auto'
        },
    }),
);

export default function Diagnosis() {
    const classes = useStyles();
    const [toggle, setToggle] = useState(useToggleForLineChart());
    const handleChange = () => () => {
        console.log("change")
        setToggle(!toggle)
        setToggleForLineChart(!toggle)
        broadcastToggleChange()
    };


    return (
        <div className={classes.container}>
            <Typography>
                Diagnosis Mode
      </Typography>
            <TreeView
                className={classes.treeView}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                <FormControlLabel
                    control={<Switch
                        checked={useToggleForLineChart()}
                        onChange={handleChange()}/>}
                    label={"diagnostic mode"}
                />
            </TreeView>
        </div>

    );
}
