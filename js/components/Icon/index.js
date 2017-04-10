
import styled from 'styled-components/native';
import Icon from '@expo/vector-icons/Entypo';

export default styled(Icon)`
  color: ${props => props.theme.iconColor};
  font-size: ${props => props.theme.iconFontSize};
`;
