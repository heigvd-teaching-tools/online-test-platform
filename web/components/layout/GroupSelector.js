import DropDown from "../input/DropDown";
import GroupIcon from "@mui/icons-material/Group";
import { Button, MenuItem, Stack, Typography} from "@mui/material";
import {useGroup} from "../../context/GroupContext";
import Link from "next/link";

const GroupSelector = () => {
    const { groups, group, switchGroup } = useGroup();
    const findGroup = (label) => groups.find((group) => group.label === label);

    return(
        groups?.length > 0 && (
            <DropDown
                name="group"
                defaultValue={group?.label}
                minWidth={'100px'}
                icon={<GroupIcon />}
                variant={"filled"}
                onChange={(label) => switchGroup(findGroup(label))}
            >
                <Stack p={1}>
                    <Typography variant={"h6"}>Your groups</Typography>
                </Stack>
                {groups.map((group) => (
                    <MenuItem key={group.id} value={group.label}>{group.label}</MenuItem>
                ))}
                <Stack p={1}>
                    <Link href={`/groups`}>
                        <Button startIcon={<GroupIcon />}>Manage Groups</Button>
                    </Link>
                </Stack>
            </DropDown>
        )
    )
}

export default GroupSelector;
