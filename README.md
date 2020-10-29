# sublime_alignment

# Generating data on genbank files


```bash
docker run -it -v $(pwd)/testthis:/code/data seth1/sublime_alignment:1.0 /bin/bash

Hi Tilmann,
hier ist eine test version des alignment programms. Haettest du naechste Woche Zeit fuer ein kurzes Meeting? Ich wollte dieses Programm eigentlich schon viel frueher fertig haben aber es ist sehr schwierig neben dem job die Zeit zu finden.

Alles ist in einem docker container um es universell laufen zu koennen. Obwohl ich nicht weiss wie gut es unter windows laufen wuerde. Um den container zu bekommen einfach docker pull seth1/sublime_alignment:1.0 ich eine shell eingeben.

Danach koennen antismash files und mibig files jeweils in Ordnern (hier data) analysiert werden:

docker run -it -v $(pwd)/testthis:/code/data seth1/sublime_alignment:1.0 python3 bin/extract_regions_and_align.py data/antismash_files/\*.gbk data/mibig_files/\*.gbk 1 data/results

Um die visualisierung zu starten kann man diesen Befehl benutzen:

docker run -it -p 8000:8000 -v $(pwd)/testthis:/code/data seth1/sublime_alignment:1.0 python3 -m http.server

Test files habe ich im Anhang hinterlegt.

python3 bin/extract_regions_and_align.py data/antismash_files/\*.gbk data/mibig_files/\*.gbk 1 data/results
python3 bin/extract_regions_and_align.py data/antismash_files/\*.gbk data/mibig_files/\*.gbk 1 data/results

python bin/extract_regions_and_align.py ../new_asfiles/\*.gbk ../mibig_set/\*.gbk 2 test_data
python bin/extract_regions_and_align.py /path/to/antismash_files/\*.gbk /path/to/mibig_references/\*.gbk 2 test_data

python bin/extract_regions_and_align.py ../antismash_data_subset/\*.gbk ../mibig_set/\*.gbk 2 test_data
```

Example mibig files:

```
BGC0000133.gbk BGC0000136.gbk BGC0000419.gbk BGC0000455.gbk BGC0001459.gbk BGC0001461.gbk BGC0001462.gbk BGC0001471.gbk BGC0001658.gbk BGC0001714.gbk
```