import React, {createContext, useState, useContext, useCallback, useEffect} from 'react';
import {useSession} from "next-auth/react";
import {useSnackbar} from "./SnackbarContext";

const GroupContext = createContext();
export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
    const { show: showSnackbar } = useSnackbar();
    const { data: session } = useSession();

    const [ group, setGroup ] = useState(undefined);
    const [ groups, setGroups ] = useState([]);

    useEffect(() => {
        if(session) {
            if(!session.user.selected_group && session.user.groups.length > 0) {
                // if the user has no selected group, select the first one
                (async () => {
                    const group = session.user.groups[0].group;
                    await switchGroup(group);
                    showSnackbar(`You have been assigned to the group ${group.label}`, 'info');
                })();
            }else{
                setGroup(session.user.selected_group);
                setGroups(session.user.groups.map(userToGroup => userToGroup.group));
            }
        }
    }, [session]);

    const mutate = async () => {
        // refetch the groups
        const response = await fetch('/api/users/groups', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            const data = await response.json();
            showSnackbar(data.message, 'error');
            return;
        }

        const data = await response.json();
        setGroups(data.map(userToGroup => userToGroup.group));
    }

    const switchGroup = useCallback(async (group) => {
        // the session will change by the NextAuth callbacks once the data is updated in the database
        const response = await fetch('/api/users/groups/select', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                groupId: group.id
            })
        });

        if(!response.ok) {
            const data = await response.json();
            showSnackbar(data.message, 'error');
            return;
        }

        setGroups(groups.map(g => {
            if (g.id === group.id) {
                g.selected = true;
            } else {
                g.selected = false;
            }
            return g;
        }));

        setGroup(group);
    }, [groups]);

    return (
        <GroupContext.Provider value={{
            group,
            groups,
            switchGroup,
            mutate
        }}>
            {children}
        </GroupContext.Provider>
    );
}
