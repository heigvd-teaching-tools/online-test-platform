import React, {
  createContext,
  useContext,
} from 'react'
import {fetcher} from "../code/utils";
import useSWR from "swr";

const GroupContext = createContext()
export const useGroup = () => useContext(GroupContext)

export const GroupProvider = ({ children }) => {

  const { data: groups , mutate, error } = useSWR(
    `/api/users/groups`,
    fetcher
  )


    const switchGroup = async (scope) => {
        // Persist the selected group in the database
        await fetch('/api/users/groups/select', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupScope: scope,
            }),
        }).finally(() => {
            mutate()
        });
    }

  return (

    <GroupContext.Provider value={{
      groups,
      switchGroup,
      mutate,
      error,
    }}>
      {groups && children}
    </GroupContext.Provider>
  )
}
