# Treatment recommender webapp

### Local install

```bash
# download repository and cd into it
conda env create --prefix=./venv --file=./environment.yml 
conda activate ./venv/

cd doctorsite/frontend
npm install
npm run build
cd ../../

python doctorsite/manage.py migrate
python doctorsite/manage.py createsuperuser
python doctorsite/manage.py collectstatic

# Train the model on the training dataset
python doctorsite/doctorapp/algorithm/train_model.py doctorsite/doctorapp/algorithm/pickles/full_training_set_v2_includes_all_rounds_supplemented_with_modified_regimens_from_harvesting_rounds_to_exclude_three_drugs.csv octorsite/doctorapp/algorithm/pickles/model.pkl

python doctorsite/manage.py runserver

# browse to localhost:8000/admin to add doctors, doctors are linked to patients using the assoc_doctors field in the json file and matching it to the doctor id used in hte admin panel
# browse to localhost:8000/ to login using either the admin account created, or a newly created doctor to see tha patients and run the treatment recommender
```

This is a dummy exmaple to showcase the webapp and the treatment recommender, but it contains no real patient data, and should be connected to a real database before use.
