import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  Avatar,
  CardMedia,
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useAuth } from 'src/contexts/AuthContext';

import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';

const Input = styled('input')({
  display: 'none'
});

const AvatarWrapper = styled(Card)(
  ({ theme }) => `

    position: relative;
    overflow: visible;
    display: inline-block;
    margin-top: -${theme.spacing(9)};
    margin-left: ${theme.spacing(2)};

    .MuiAvatar-root {
      width: ${theme.spacing(16)};
      height: ${theme.spacing(16)};
    }
`
);

const ButtonUploadWrapper = styled(Box)(
  ({ theme }) => `
    position: absolute;
    width: ${theme.spacing(4)};
    height: ${theme.spacing(4)};
    bottom: -${theme.spacing(1)};
    right: -${theme.spacing(1)};

    .MuiIconButton-root {
      border-radius: 100%;
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      box-shadow: ${theme.colors.shadows.primary};
      width: ${theme.spacing(4)};
      height: ${theme.spacing(4)};
      padding: 0;
  
      &:hover {
        background: ${theme.colors.primary.dark};
      }
    }
`
);

const CardCover = styled(Card)(
  ({ theme }) => `
    position: relative;

    .MuiCardMedia-root {
      height: ${theme.spacing(26)};
    }
`
);

const CardCoverAction = styled(Box)(
  ({ theme }) => `
    position: absolute;
    right: ${theme.spacing(2)};
    bottom: ${theme.spacing(2)};
`
);

const ProfileCover = ({ user }) => {
  const { updateProfileImage, updateCoverImage } = useAuth();
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const defaultCoverImage = '/static/images/placeholders/covers/1.jpg';
  const defaultAvatar = '/static/images/avatars/1.jpg';

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      await updateProfileImage(file);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      await updateCoverImage(file);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <>
      <CardCover>
        <CardMedia image={user.coverImage || defaultCoverImage} />
        <CardCoverAction>
          <Input
            accept="image/*"
            id="change-cover"
            type="file"
            onChange={handleCoverImageChange}
          />
          <label htmlFor="change-cover">
            <Button
              startIcon={<UploadTwoToneIcon />}
              variant="contained"
              component="span"
              disabled={uploadingCover}
            >
              {uploadingCover ? 'Uploading...' : 'Change cover'}
            </Button>
          </label>
        </CardCoverAction>
      </CardCover>
      <AvatarWrapper>
        <Avatar
          variant="rounded"
          alt={user.fullName || user.name}
          src={user.profileImage || user.avatar || defaultAvatar}
        />
        <ButtonUploadWrapper>
          <Input
            accept="image/*"
            id="icon-button-file"
            name="icon-button-file"
            type="file"
            onChange={handleProfileImageChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              component="span"
              color="primary"
              disabled={uploadingProfile}
            >
              <UploadTwoToneIcon />
            </IconButton>
          </label>
        </ButtonUploadWrapper>
      </AvatarWrapper>
      <Box py={2} pl={2} mb={3}>
        <Typography gutterBottom variant="h4">
          {user.fullName || user.name}
        </Typography>
        <Typography variant="subtitle2" color="text.primary">
          {user.email || user.jobtitle}
        </Typography>
        {user.joinDate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Joined {user.joinDate}
          </Typography>
        )}
      </Box>
    </>
  );
};

ProfileCover.propTypes = {
  // @ts-ignore
  user: PropTypes.object.isRequired
};

export default ProfileCover;
