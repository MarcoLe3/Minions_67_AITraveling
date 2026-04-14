import Button from '@mui/material/Button';

interface BasicButtonProps {
    onClick?: () => void
}

export default function BasicButtons({ onClick }: BasicButtonProps) {
    return (
        <Button variant="contained" onClick={onClick} >
            Apply
        </Button>
    );
}