import React from 'react';
import {Stack} from "expo-router";

const RootLayout = () =>{
    return(
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name='index'/>
            <Stack.Screen name='loginManager'/>
            <Stack.Screen name='loginEmployee'/>
            <Stack.Screen name='managerHome'/>
            <Stack.Screen name='employeeHome'/>
            <Stack.Screen name='managerProfile'/>
            <Stack.Screen name='addEmployee'/>
            <Stack.Screen name='showAllEmployee'/>
            <Stack.Screen name='employeeDetail'/>
            <Stack.Screen name='EditEmployee'/>
            <Stack.Screen name='AddManager'/>
            <Stack.Screen name='salleryEmployee'/>
            <Stack.Screen name='EmployeeProfileScreen'/>
            <Stack.Screen name='AttendanceScreen'/>
            <Stack.Screen name='LeaveScreen'/>
            <Stack.Screen name='PerformanceScreen'/>
            <Stack.Screen name='AcceptLeaveScreen'/>
            <Stack.Screen name='SalerySlipScreen'/>










            





        </Stack>
    )
}
export default RootLayout;
