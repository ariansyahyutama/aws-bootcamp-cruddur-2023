import './ProfileForm.css';
import React from "react";
import process from 'process';
import {checkAuth, getAccessToken} from '../lib/CheckAuth';

export default function ProfileForm(props) {
  const [bio, setBio] = React.useState(0);
  const [displayName, setDisplayName] = React.useState(0);

  React.useEffect(()=>{
    console.log('useEffects',props)
    setBio(props.profile.bio);
    setDisplayName(props.profile.display_name);
  }, [props.profile])

  const s3uploadkey = async (event)=> {
    try {
      console.log('s3upload')
      const backend_url = "https://79qezmh6s3.execute-api.us-east-1.amazonaws.com/avatars/key_upload"
      await getAccessToken()
      const access_token = localStorage.getItem("access_token")
      const res = await fetch(backend_url, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }})
      let data = await res.json();
      if (res.status === 200) {
        console.log('presigned url',data)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const s3upload = async (event)=> {
    console.log('event',event)
    const file = event.target.files[0]
    console.log('file',file)
    const filename = file.name
    const size = file.size
    const type = file.type
    const preview_image_url = URL.createObjectURL(file)
    console.log(filename,size,type)

    try {
      console.log('s3upload')
      const backend_url = "https://cruddur-uploaded-avatars-ghuronline-2.s3.amazonaws.com/mock.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3JTQ5BKWVIGXHHO4%2F20230720%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230720T143629Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=9cb4811e408c212652a71b106c79cd26d1df766f32b507c53cbe3498896c5fa6"
      const res = await fetch(backend_url, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': type
      }})
      let data = await res.json();
      if (res.status === 200) {
        console.log('presigned url',data)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const onsubmit = async (event)=> {
    event.preventDefault();
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/profile/update`
      await getAccessToken()
      const access_token = localStorage.getItem("access_token")
      const res = await fetch(backend_url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: bio,
          display_name: displayName
        }),
      });
      let data = await res.json();
      if (res.status === 200) {
        setBio(null)
        setDisplayName(null)
        props.setPopped(false)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const bio_onchange = (event) => {
    setBio(event.target.value);
  }

  const display_name_onchange = (event) => {
    setDisplayName(event.target.value);
  }

  const close = (event)=> {
    if (event.target.classList.contains("profile_popup")) {
      props.setPopped(false)
    }
  }

  if (props.popped === true) {
    return (
      <div className="popup_form_wrap profile_popup" onClick={close}>
        <form 
          className='profile_form popup_form'
          onSubmit={onsubmit}
        >
          <div className="popup_heading">
            <div className="popup_title">Edit Profile</div>
            <div className='submit'>
              <button type='submit'>Save</button>
            </div>
          </div>
          <div className="popup_content">

            <div className="upload" onClick={s3uploadkey}>
              Upload Avatar
            </div>
          <input type="file" name="avatarupload" onChange={s3upload} />

            <div className="field display_name">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={display_name_onchange} 
              />
            </div>
            <div className="field bio">
              <label>Bio</label>
              <textarea
                placeholder="Bio"
                value={bio}
                onChange={bio_onchange} 
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}