import DropDown from "../input/DropDown";
import GroupIcon from "@mui/icons-material/Group";
import {MenuItem} from "@mui/material";
import {useGroup} from "../../context/GroupContext";

const GroupSelector = () => {
    const { groups, group, changeGroup } = useGroup();
    const findGroup = (label) => groups.find((group) => group.label === label);

    return(
        groups?.length > 0 && (
            <DropDown
                name="group"
                defaultValue={group?.label}
                minWidth={'100px'}
                icon={<GroupIcon />}
                variant={"filled"}
                onChange={(label) => changeGroup(findGroup(label))}
            >
                {groups.map((group) => (
                    <MenuItem key={group.id} value={group.label}>{group.label}</MenuItem>
                ))}
            </DropDown>
        )
    )

}

export default GroupSelector;
