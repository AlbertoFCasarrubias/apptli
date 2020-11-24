import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  private _json: Subject<any> = new Subject<any>();
  public readonly json: Observable<object> = this._json.asObservable();

  private _edit: Subject<any> = new Subject<any>();
  public readonly edit: Observable<object> = this._edit.asObservable();

  private _tabs: Subject<any> = new Subject<any>();
  public readonly tabs: Observable<object> = this._tabs.asObservable();

  constructor() { }

  dates: any;
  abuelosTiosFlag: any;
  consulta = {
    date: '',
    peso: 0,
    grasa: 0,
    agua: 0,
    grasaVisceral: 0,
    pesoMuscular: 0,
    edadMetabolica: 0,
    edadOsea: 0,
    pecho: 0,
    cintura: 0,
    cadera: 0,
    bd: 0,
    bi: 0,
    pd: 0,
    pi: 0
  };
  consultasArray: any[] = [];
  jsonData = {
    name: '',
    height: 0,
    age: 0,
    family: {
      maternos: {
        abuelo: '',
        abuela: '',
        tios: ''
      },
      paternos: {
        abuelo: '',
        abuela: '',
        tios: ''
      },
      padre: '',
      madre: '',
      hermanos: ''
    },
    antecedentes: {
      alergias: '',
      medicamentos: '',
      tabaquismo: '',
      alcoholismo: '',
      enfermedades: '',
      cirugias: ''
    },
    alimenticios : {
      desayuno: '',
      colacionMatutina: '',
      comida: '',
      colacionVespertina: '',
      cena: ''
    },
    consultas: this.consultasArray
  };

  getJSON() {
    return this.json;
  }

  setJSON(json) {
    this._json.next({json});
  }

  setEdit(edit) {
    this._edit.next({edit});
  }

  setTabs(tabs) {
    this._tabs.next({tabs});
  }

  parseFile(file) {
    const fileSplit = file.split(/[\r\n]+/);
    for(const rowLine in fileSplit) {
      const line = fileSplit[rowLine];
      // console.log(rowLine, line);
      if (line) {
        switch (Number(rowLine)) {
          case 0:
            this.jsonData.name = line;
            break;

          case 1:
            this.jsonData.height = line;
            break;

          default:
            this.setValue(line, 'Edad', 'age');
            this.setValue(line, 'Edad', 'age');

            this.setMaternoPaterno(line, 'Abuelos');
            this.setFamilyValue(line, this.abuelosTiosFlag, 'Abuelo', 'abuelo');
            this.setFamilyValue(line, this.abuelosTiosFlag, 'Abuela', 'abuela');
            this.setFamilyValue(line, 'maternos', 'Tíos maternos', 'tios');
            this.setFamilyValue(line, 'paternos', 'Tíos paternos', 'tios');

            this.setValueField(line, 'Padre', 'family', 'padre');
            this.setValueField(line, 'Madre', 'family', 'madre');
            this.setValueField(line, 'Hermanos', 'family', 'hermanos');

            this.setValueField(line, 'Alergias', 'antecedentes', 'alergias');
            this.setValueField(line, 'Medicamentos', 'antecedentes', 'medicamentos');
            this.setValueField(line, 'Tabaquismo', 'antecedentes', 'tabaquismo');
            this.setValueField(line, 'Alcoholismo', 'antecedentes', 'alcoholismo');
            this.setValueField(line, 'Enfermedades', 'antecedentes', 'enfermedades');
            this.setValueField(line, 'Cirugías', 'antecedentes', 'cirugias');

            this.setValueField(line, 'Desayuno', 'alimenticios', 'desayuno');
            this.setValueField(line, 'Colación matutina', 'alimenticios', 'colacionMatutina');
            this.setValueField(line, 'Comida', 'alimenticios', 'comida');
            this.setValueField(line, 'Colación vespertina', 'alimenticios', 'colacionVespertina');
            this.setValueField(line, 'Cena', 'alimenticios', 'cena');

            this.parseDates(line);
            this.setConsultaValue(line, 'Peso:', 'Peso:', 'peso');
            this.setConsultaValue(line, '%grasa', '%grasa', 'grasa');
            this.setConsultaValue(line, 'agua', 'agua', 'agua');
            this.setConsultaValue(line, 'Grasa visceral', 'Grasa visceral', 'grasaVisceral');
            this.setConsultaValue(line, 'Peso muscular', 'Peso muscular', 'pesoMuscular');
            this.setConsultaValue(line, 'Edad metabólica', 'Edad metabólica', 'edadMetabolica');
            this.setConsultaValue(line, 'Edad ósea', 'Edad ósea', 'edadOsea');
            this.setConsultaValue(line, 'Pecho', 'Pecho', 'pecho');
            this.setConsultaValue(line, 'Cintura', 'Cintura', 'cintura');
            this.setConsultaValue(line, 'Cadera', 'Cadera', 'cadera');
            this.setConsultaValue(line, 'Bd', 'Bd', 'bd');
            this.setConsultaValue(line, 'BI', 'BI', 'bi');
            this.setConsultaValue(line, 'PD', 'PD', 'pd');
            this.setConsultaValue(line, 'Pi', 'Pi', 'pi');

            break;
        }
      }
    }

    return this.jsonData;
  }

  private setMaternoPaterno(line, label) {
    if (line.indexOf(label) !== -1) {
      const lineSplit = line.split(' ');
      this.abuelosTiosFlag = this.cleanCharacters(lineSplit[1]);
    }
  }

  private setFamilyValue(line, maternoPaterno, label, field) {
    if (line.indexOf(label) !== -1) {
      const lineSplit = line.split(label);
      if (lineSplit.length === 2) {
        this.jsonData.family[maternoPaterno][field] = this.cleanCharacters(lineSplit[1]);
      }
    }
  }

  private setValueField(line, label, parentField, field) {
    if (line.indexOf(label) !== -1) {
      const lineSplit = line.split(label);
      if (lineSplit.length === 2) {
        this.jsonData[parentField][field] = this.cleanCharacters(lineSplit[1]);
      }
    }
  }

  private setValue(line, label, field) {
    if (line.indexOf(label) !== -1) {
      const lineSplit = line.split(' ');
      if (lineSplit.length === 2) {
        this.jsonData[field] = this.cleanCharacters(lineSplit[1]);
      }
    }
  }

  private parseDates(line) {
    const regex = /(\d{1,2})\/(\d{1,2})\/(\d{2})/;
    const date = line.search(regex);
    if (date !== -1) {
      const lineSplit = line.split('--');
      this.dates = lineSplit.length;
      for (const d of lineSplit) {
        const c = Object.assign({}, this.consulta);
        c.date = d;
        this.jsonData.consultas.push(c);
      }
    }
  }

  private setConsultaValue(line, indexOf, separator, field) {
    if (line.indexOf(indexOf) !== -1) {
      const objSplit = this.parseMedidas(line, separator);

      for(const i in objSplit) {
        if(Number(i) < this.dates) {
          this.jsonData.consultas[Number(i)][field] = this.cleanData(objSplit[i]);
        }
      }
    }
  }

  private cleanCharacters(data: any){
    let flag: any = data;
    flag = flag.replace(':', '');
    flag = flag.replace('.', '');
    return flag.trim();
  }

  private cleanData(data: any) {
    let flag: any = data;
    flag = flag.replace(':', '');
    flag = flag.replace('-', '');
    return flag.trim();
  }

  private parseMedidas(line: string, separator: string) {
    const lineSplit = line.split(separator);
    const data = lineSplit[1];
    return data.split('--');
  }
}
