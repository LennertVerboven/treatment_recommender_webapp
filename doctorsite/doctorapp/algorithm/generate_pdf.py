import datetime
import logging
import os

import pandas as pd

from pylatex import Document, PageStyle, Head, MiniPage, Foot, LargeText, FootnoteText, NewLine, Command, \
    MediumText, LineBreak, simple_page_number, MediumText, NoEscape, Section, Tabu, Package,\
    utils
from pylatex.base_classes import Environment
from pylatex.basic import TextColor
from pylatex.lists import Itemize
from pylatex.table import MultiRow

from collections import defaultdict

from doctorsite.settings import REPORT_PDF_DIR

logger = logging.getLogger('django')


newtcolorbox = r"""\newtcolorbox{reportSection}[2][]{%
  attach boxed title to top left
  			   = {xshift=10pt, yshift=-8pt},
  colback      = white!5!white,
  colframe     = white!75!black,
  fonttitle    = \bfseries,
  colbacktitle = white,
  title        = \textbf{\large{#2}},
  coltitle	   = black,
  arc = 0mm,
  opacityframe = 0.5,
  boxrule=1pt,
  boxed title style={%
    sharp corners,
    rounded corners=northwest,
    colback=white,
    boxrule=0pt,
    titlerule=0mm},
  enhanced,
  #1
}"""

class ReportSection(Environment):
    _latex_name = 'reportSection'

def __create_header(nhls_number, date, facility):
    header = PageStyle("header")
    with header.create(Head("L")):
        header.append(LargeText(utils.bold("MYCOBACTERIUM TUBERCULOSIS")))
        header.append(LineBreak())
        header.append(LargeText(utils.bold("GENOME SEQUENCING REPORT")))
    with header.create(Head("R")):
        print(r'\includegraphics[height=2.5\baselineskip]{' + REPORT_PDF_DIR + r'/figures/smartt.png}')
        header.append(NoEscape(r'\includegraphics[height=2.5\baselineskip]{' + REPORT_PDF_DIR + r'/figures/smartt.png}'))
        #header.append(NoEscape(r'\includegraphics[height=2.5\baselineskip]{../generate_pdf/pdf_template/figure/smartt.png}'))

    with header.create(Foot("L")):
        header.append(simple_page_number())
    with header.create(Foot("R")):
        header.append("NHLS Number: {} | DATE: {} | FACILITY: {}".format(nhls_number, date, facility))
    return header

def __add_rows_to_wgs_table(wgs_table, rows, interpretation, drug_tag, info_tag, color='white'):
    for idx, drug in enumerate(rows):
        c_1 = ''
        if idx == 0:
            wgs_table.add_hline()
        if idx == len(rows) - 1:
            c_1 = NoEscape(r'\cellcolor{{{color}}}\multirow{{{size}}}{{*}}{{{interpretation}}}'.format(color=color, interpretation=interpretation, size=-len(rows)))
        else:
            c_1 = NoEscape(r'\cellcolor{{{color}}}'.format(color=color))
        wgs_table.add_row([c_1,
                           FootnoteText([NoEscape(r'\cellcolor{{{color}}}'.format(color=color)), drug[drug_tag].replace('_', ' ').title()]),
                           FootnoteText([NoEscape(r'\cellcolor{{{color}}}'.format(color=color)), '' if pd.isna(info_tag) else drug[info_tag]])
                          ])

def generate_pdf_report(patient, pretreatment, regimen_number, timestamp):
    pt = defaultdict(lambda:'NA')
    pt.update(patient)
    patient = pt
    reportdate = datetime.datetime.strftime(timestamp, '%Y-%m-%d')
    geometry_options = {"margin": "0.75in", "headheight": "77pt", "top": "3.5cm"}
    doc = Document(geometry_options=geometry_options)
    doc.packages.append(Package('xcolor', 'table'))

    doc.preamble.append(Command('usepackage', 'multirow'))
    doc.preamble.append(Command('usepackage', 'enumitem'))
    doc.preamble.append(Command('usepackage', 'tcolorbox', 'skins'))
    doc.preamble.append(Command('usepackage', 'fontspec'))
    doc.preamble.append(Command('usepackage', 'hyphenat', 'none'))

    doc.preamble.append(Command('definecolor', ['easygreen','RGB','86, 158, 46']))
    doc.preamble.append(Command('definecolor', ['easyred','RGB','171, 38, 38']))
    doc.preamble.append(Command('definecolor', ['customlightgray','HTML','EFEFEF']))
    doc.preamble.append(Command('definecolor', ['customdarkgray','HTML','D9D9D9']))

    doc.preamble.append(Command('defaultfontfeatures', 'Ligatures=TeX'))
    doc.preamble.append(Command('setmainfont', 'lato'))

    doc.preamble.append(NoEscape(newtcolorbox))

    doc.preamble.append(__create_header(patient['smarttt_id'], reportdate, patient['hospital']))

    doc.change_document_style("header")

    # Patient Info
    doc.append(Command('tabulinesep=5pt'))
    doc.append(Command('noindent'))
    doc.append(Command('taburulecolor', 'lightgray'))
    with doc.create(Tabu("|X[.16]X[r,.34]||X[.16]X[r,.34]|", to=r'\textwidth', width=4)) as patient_table:
        patient_table.add_hline()
        patient_table.add_row(['Patient Name', patient['name'], 'Phone', patient['phone_number']])
        patient_table.add_row(['Birth date', patient['date_of_birth'], 'Sample', patient['smarttt_id']])
        patient_table.add_row(['Gender', patient['sex'], 'Weight (Kg)', patient['weight_in_kg']])
        patient_table.add_row(['Facility', patient['hospital'], 'Facility contact', patient['facility_contact']])
        patient_table.add_row(['Requested by', patient['requested_by'], 'Sequenced from', patient['sequenced_from']])
        patient_table.add_row(['Sample type', patient['sample_type'], 'Sample date', patient['sample_date']])
        patient_table.add_row(['Sample number', patient['sample_number'], 'Report date', reportdate])
        patient_table.add_hline()

    doc.append(Command('vspace', '5mm'))

    # Drug resistance Summary
    with doc.create(ReportSection(arguments=['Drug Resistance Profile'], options=['boxrule=4pt'])):
        doc.append(Command('vspace', '1mm'))
        doc.append(NoEscape('This ' + utils.italic('Mycobacterium tuberculosis') + ' strain is predicted to be:'))
        with doc.create(Itemize(options=['leftmargin=0pt', 'label='])) as itemize:
            r_summary = [i['drug'].replace('_', ' ').title() for i in patient['resistant']]
            s_summary = [i['drug'].replace('_', ' ').title() for i in patient['susceptible']]
            if r_summary:
                summary = [TextColor('easyred', utils.bold(i)+NoEscape('%')) for i in r_summary]
                #summary = [utils.bold(i)+NoEscape('%') for i in r_summary]
                itemize.append(Command('item'))
                itemize.append('Resistant to: ')
                for idx, drug in enumerate(summary):
                    itemize.append(drug)
                    if idx == len(summary) - 2:
                        itemize.append(', and ')
                    elif idx < len(summary) - 2:
                        itemize.append(', ')
            if s_summary:
                summary = [TextColor('easygreen', utils.bold(i)+NoEscape('%')) for i in s_summary]
                #summary = [utils.bold(i)+NoEscape('%') for i in s_summary]
                itemize.append(Command('item'))
                itemize.append('Susceptible to: ')
                for idx, drug in enumerate(summary):
                    itemize.append(drug)
                    if idx == len(summary) - 2:
                        itemize.append(', and ')
                    elif idx < len(summary) - 2:
                        itemize.append(', ')

    doc.append(Command('vspace', '5mm'))

    # Clinical information
    with doc.create(ReportSection(arguments=['Clinical Information'])):
        doc.append(Command('vspace', '1mm'))
        doc.append(Command('tabulinesep=3pt'))
        doc.append(Command('noindent'))
        doc.append(Command('taburulecolor', 'lightgray'))
        with doc.create(Tabu("X[.7]X[r,.3]|X[.7]X[r,.3]", to=r'\textwidth', width=4)) as clinical_table:
            clinical_table.add_row(['Hb (g/dL)'              , pretreatment['hb']                                , 'Platelets (*10^9/L)'          , pretreatment['platelets']])
            clinical_table.add_row(['Neutrophils (cells/mcL)', pretreatment['neutrophils']                       , 'GFR (mL/min)'                 , pretreatment['egfr_status']])
            clinical_table.add_row(['ALT (IU/L)'             , pretreatment['alt_status']                        , 'QTc (ms)'                     , pretreatment['qtc']])
            clinical_table.add_row(['Hearing loss'           , 'Yes' if pretreatment['hearing'] else 'No'        , 'Painful peripheral neuropathy', 'Yes' if pretreatment['neuropathy'] else 'No'])
            clinical_table.add_row(['Psychosis'              , 'Yes' if pretreatment['psychosis'] else 'No'      , 'Poorly controlled epilepsy'   , 'Yes' if pretreatment['seizure_disorder'] else 'No'])
            clinical_table.add_row(['Visual problems'        , 'Yes' if pretreatment['visual_problems'] else 'No', 'Pregnant'                     , 'Yes' if pretreatment['pregnancy_status'] else 'No'])

    doc.append(Command('vspace', '5mm'))

    # Proposed regimen
    with doc.create(ReportSection(arguments=['Proposed Individual Treatment Regimen'])):
        doc.append(Command('vspace', '1mm'))
        doc.append(Command('tabulinesep=3pt'))
        doc.append(Command('noindent'))
        doc.append(Command('taburulecolor', 'lightgray'))
        with doc.create(Tabu("X[0.3]X[r,.75]", to=r'\textwidth', width=2)) as treatment_table:
            treatment_table.add_row(['Drug', 'Dosage (mg)'])
            treatment_table.add_hline()
            for prescription in patient['prescriptions']:
                treatment_table.add_row([prescription['drug_name'].replace('_', ' ').title(), prescription['dosage_in_mg']])

    doc.append(Command('pagebreak'))

    # Change to logo in the upper right corner for the second page
    with doc.create(Head("R")):
        doc.append(NoEscape(r'\includegraphics[height=2.5\baselineskip]{' + REPORT_PDF_DIR + r'/figures/torch.png}'))


    # Speciation results
    with doc.create(ReportSection(arguments=['Organism'])):
        doc.append(Command('vspace', '1mm'))
        doc.append(NoEscape('The specimen was positive for ' + utils.italic(utils.bold("Mycobacterium tuberculosis")) + ', lineage ' + patient['lineage']))

    doc.append(Command('vspace', '5mm'))

    # WGS results
    with doc.create(ReportSection(arguments=['Drug Indications'])):
        doc.append(Command('vspace', '1mm'))
        doc.append(FootnoteText('Resistance is reported when a high-confidence resistance-conferring mutation is detected. '))
        doc.append(FootnoteText(utils.bold('``No mutation detected\'\' does not exclude the possibility of resistance')))
        doc.append(Command('vspace', '3mm'))
        doc.append(Command('\\'))
        doc.append(Command('tabulinesep=1pt'))
        doc.append(Command('noindent'))
        doc.append(Command('taburulecolor', 'lightgray'))
        with doc.create(Tabu("X[0.75,l]X[0.75,l]X[2,l]", to=r'\textwidth', width=3)) as wgs_table:
            wgs_table.add_row(['Interpretation', 'Drug', 'Comments'])

            # Add Susceptible drugs
            __add_rows_to_wgs_table(wgs_table, patient['susceptible'], interpretation='Susceptible', drug_tag='drug', info_tag='gene', color='white')

            # Change the color of the hlines
            doc.append(Command('taburulecolor', 'black'))

            # Add Stockouts
            __add_rows_to_wgs_table(wgs_table, patient['stockouts'], interpretation='Stockouts', drug_tag='drug_name', info_tag=None, color='customlightgray')

            # Add Resistant drugs
            __add_rows_to_wgs_table(wgs_table, patient['resistant'], interpretation='Resistant', drug_tag='drug', info_tag='gene', color='customdarkgray')

            # Add Contraindications
            __add_rows_to_wgs_table(wgs_table, patient['contra_indications'], interpretation='Contra indicated', drug_tag='drug_name', info_tag='indication', color='customdarkgray')

    doc.append(Command('vspace', '5mm'))

    pdf_name = '{}_{}'.format(patient['smarttt_id'], int(regimen_number))
    pdf_file = os.path.join(REPORT_PDF_DIR, pdf_name)
    logger.info(pdf_file)
    doc.generate_pdf(pdf_file, clean=False, clean_tex=False, compiler="lualatex")
    doc.generate_pdf(pdf_file, clean=True , clean_tex=False, compiler="lualatex")
    return pdf_name + '.pdf'
