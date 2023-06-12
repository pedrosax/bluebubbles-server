import React from 'react';
import {
    Select,
    Flex,
    FormControl,
    FormLabel,
    FormHelperText

} from '@chakra-ui/react';
import { useAppSelector } from '../../hooks';
import { onSelectChange } from '../../actions/ConfigActions';


export interface PrivateApiModeFieldProps {
    helpText?: string;
    showAddress?: boolean;
}

// const confirmationActions: ConfirmationItems = {};

export const PrivateApiModeField = ({ helpText }: PrivateApiModeFieldProps): JSX.Element => {
    const mode: string = (useAppSelector(state => state.config.private_api_mode) ?? '').toLowerCase().replace(' ', '-');
    // const [requiresConfirmation, confirm] = useState((): string | null => {
    //     return null;
    // });
    return (
        <FormControl>
            <FormLabel htmlFor='private_api_mode'>Private API Injection Method</FormLabel>
            <Flex flexDirection='row' justifyContent='flex-start' alignItems='center'>
                <Select
                    id='private_api_mode'
                    maxWidth="15em"
                    mr={3}
                    value={mode}
                    onChange={(e) => {
                        if (!e.target.value || e.target.value.length === 0) return;
                        onSelectChange(e);
                    }}
                >
                    <option value='macforge'>MacForge Bundle</option>
                    <option value='process-dylib'>Messages App DYLIB</option>
                </Select>
            </Flex>
            <FormHelperText>
                {helpText ?? (
                    'Select how you want the BlueBubbles Private API Helper Bundle to be injected into the Messages App. ' +
                    'Selecting "MacForge Bundle" will require MacForge to be installed. Selecting "Messages App DYLIB" will ' +
                    'create a 2nd Messages app in your dock which will have the BlueBubbles Helper injected into it.'
                )}
            </FormHelperText>
        </FormControl>
    );
};