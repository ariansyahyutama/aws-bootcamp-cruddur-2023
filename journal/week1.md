# Week 1 — App Containerization

follow these steps and have to configure a new config

# Install python version
```
pyenv install 3.10.9
```

# Set your python version
```
pyenv global 3.10.9
```

# Create virual environment
```
python -m venv venv
```

# Activate environment
```
source venv/bin/activate
```

# Install Flask
```
pip install flask
```

follow all those above steps and got following error
<img width="879" alt="image" src="https://user-images.githubusercontent.com/67248935/220278750-8f7d7803-8f40-49a9-b0ab-2cff8ea01601.png">


added following config to make it works
```
pip install -U flask-cors
```

got this Json file and it seems working

<img width="843" alt="image" src="https://user-images.githubusercontent.com/67248935/220279244-94de7037-35ab-4f1d-82fc-1fab21d9fb86.png">
